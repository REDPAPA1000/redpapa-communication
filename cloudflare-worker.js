/**
 * KIS 8학년 알림이 — Cloudflare Worker
 * Web Push 릴레이 서버 (무료)
 *
 * [배포 방법]
 * 1. https://dash.cloudflare.com 접속 → 로그인 (계정 무료 생성)
 * 2. Workers & Pages → Create → Create Worker
 * 3. 아래 코드 전체 복사 → 붙여넣기 → 배포
 * 4. Worker 설정 → Variables → Environment Variables 에서 아래 두 변수 추가:
 *    - VAPID_PUBLIC_KEY  : generate_vapid.py 실행 결과 [1]번 값
 *    - VAPID_PRIVATE_JWK : generate_vapid.py 실행 결과 [3]번 값 (Encrypt 체크!)
 * 5. Worker URL 복사 (예: https://kis-push.your-name.workers.dev)
 *    → index.html 의 PUSH_WORKER_URL 상수에 붙여넣기
 */

const VAPID_SUBJECT = 'mailto:your-email@school.kr'; // ← 교사 이메일로 변경

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }
        if (request.method !== 'POST') {
            return new Response('Not Found', { status: 404 });
        }

        try {
            const { subscriptions, title, body } = await request.json();

            if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
                return json({ sent: 0, total: 0 });
            }

            const results = await Promise.allSettled(
                subscriptions.map(sub => sendPush(sub, { title, body }, env))
            );

            const sent = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`푸시 전송: ${sent}성공 / ${failed}실패 / 총 ${subscriptions.length}명`);
            return json({ sent, failed, total: subscriptions.length });

        } catch (err) {
            console.error('Worker 오류:', err);
            return json({ error: err.message }, 500);
        }
    }
};

// ── Web Push 전송 ─────────────────────────────────────────────────────────────
async function sendPush(subscription, payload, env) {
    const endpoint = subscription.endpoint;
    const audience = new URL(endpoint).origin;
    const jwt = await createVapidJwt(audience, env.VAPID_PRIVATE_JWK);

    // 페이로드를 JSON 문자열로 인코딩 (서비스워커에서 수신)
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

    const headers = {
        'Authorization': `vapid t=${jwt},k=${env.VAPID_PUBLIC_KEY}`,
        'TTL': '86400',
        'Urgency': payload.urgent ? 'high' : 'normal',
    };

    // 페이로드 암호화 (RFC 8291 aes128gcm)
    if (subscription.keys && subscription.keys.p256dh && subscription.keys.auth) {
        const encrypted = await encryptPayload(payloadBytes, subscription.keys);
        headers['Content-Type'] = 'application/octet-stream';
        headers['Content-Encoding'] = 'aes128gcm';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: encrypted,
        });

        if (response.status !== 201 && response.status !== 200) {
            const text = await response.text();
            throw new Error(`Push failed ${response.status}: ${text.slice(0, 100)}`);
        }
    } else {
        // 암호화 키 없을 때 — 빈 push (서비스워커가 고정 메시지 표시)
        headers['Content-Length'] = '0';
        const response = await fetch(endpoint, { method: 'POST', headers });
        if (response.status !== 201 && response.status !== 200) {
            throw new Error(`Push failed: ${response.status}`);
        }
    }
}

// ── VAPID JWT 생성 (ES256) ────────────────────────────────────────────────────
async function createVapidJwt(audience, privateKeyJwkStr) {
    const b64url = str =>
        btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const header = { alg: 'ES256', typ: 'JWT' };
    const payload = {
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 43200,
        sub: VAPID_SUBJECT,
    };

    const token = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

    const jwk = JSON.parse(privateKeyJwkStr);
    const key = await crypto.subtle.importKey(
        'jwk', jwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, ['sign']
    );

    const sigBuffer = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        key,
        new TextEncoder().encode(token)
    );

    const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${token}.${sig}`;
}

// ── RFC 8291 페이로드 암호화 (aes128gcm) ─────────────────────────────────────
async function encryptPayload(plaintext, keys) {
    const b64decode = str => {
        const padded = str.replace(/-/g, '+').replace(/_/g, '/');
        return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    };

    // 수신자 공개키 & auth
    const receiverPublicKeyBytes = b64decode(keys.p256dh);
    const authSecret = b64decode(keys.auth);

    // 임시 ECDH 키쌍 생성
    const senderKeyPair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
    );

    // 수신자 공개키 import
    const receiverPublicKey = await crypto.subtle.importKey(
        'raw', receiverPublicKeyBytes,
        { name: 'ECDH', namedCurve: 'P-256' }, false, []
    );

    // ECDH shared secret (32 bytes)
    const sharedSecret = await crypto.subtle.deriveBits(
        { name: 'ECDH', public: receiverPublicKey },
        senderKeyPair.privateKey, 256
    );

    // 발신자 공개키 (raw, 65 bytes)
    const senderPublicKeyBytes = new Uint8Array(
        await crypto.subtle.exportKey('raw', senderKeyPair.publicKey)
    );

    // Salt (16 bytes random)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // HKDF-SHA-256: PRK
    const prkKey = await crypto.subtle.importKey(
        'raw', authSecret, { name: 'HKDF' }, false, ['deriveBits']
    );

    // ikm = HKDF-expand(authSecret, sharedSecret || "WebPush: info\0" || receiverPub || senderPub, 32)
    const authInfo = concat(
        new TextEncoder().encode('WebPush: info\0'),
        receiverPublicKeyBytes,
        senderPublicKeyBytes
    );

    const ikmBuffer = await hkdf(prkKey, new Uint8Array(sharedSecret), authInfo, 32);

    // Content encryption key (16 bytes) & nonce (12 bytes)
    const ikm = await crypto.subtle.importKey(
        'raw', ikmBuffer, { name: 'HKDF' }, false, ['deriveBits']
    );

    const cekBuffer = await hkdf(ikm, salt, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16);
    const nonceBuffer = await hkdf(ikm, salt, new TextEncoder().encode('Content-Encoding: nonce\0'), 12);

    // AES-128-GCM 암호화
    const cekKey = await crypto.subtle.importKey('raw', cekBuffer, 'AES-GCM', false, ['encrypt']);

    // padding: 0x02 byte (delimiter) — minimal padding
    const record = concat(plaintext, new Uint8Array([0x02]));

    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonceBuffer }, cekKey, record)
    );

    // aes128gcm content coding header (salt 16B + rs 4B + keyid_len 1B + keyid 65B)
    const rs = new Uint8Array(4);
    new DataView(rs.buffer).setUint32(0, 4096, false); // record size

    const header = concat(salt, rs, new Uint8Array([senderPublicKeyBytes.length]), senderPublicKeyBytes);

    return concat(header, ciphertext);
}

// ── 유틸 ────────────────────────────────────────────────────────────────────
async function hkdf(keyMaterial, salt, info, length) {
    const saltKey = await crypto.subtle.importKey(
        'raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const prk = new Uint8Array(await crypto.subtle.sign('HMAC', saltKey, keyMaterial instanceof CryptoKey
        ? await crypto.subtle.exportKey('raw', keyMaterial)
        : keyMaterial
    ));

    const prkKey = await crypto.subtle.importKey(
        'raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const okm = new Uint8Array(await crypto.subtle.sign(
        'HMAC', prkKey, concat(info, new Uint8Array([0x01]))
    ));
    return okm.slice(0, length);
}

function concat(...arrays) {
    const total = arrays.reduce((n, a) => n + a.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) { result.set(a, offset); offset += a.length; }
    return result;
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
}
