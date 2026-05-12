"""
VAPID 키 생성 스크립트
========================
Web Push 알림에 필요한 VAPID 공개키/비공개키를 생성합니다.

사용법:
    pip install cryptography
    python generate_vapid.py

출력값을 복사해서 아래 두 곳에 붙여넣으세요:
  - index.html    → VAPID_PUBLIC_KEY 상수
  - Cloudflare Workers → 환경 변수 설정 (VAPID_PUBLIC_KEY, VAPID_PRIVATE_JWK)
"""

import sys, json, base64

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

try:
    from cryptography.hazmat.primitives.asymmetric.ec import generate_private_key, SECP256R1
    from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
    from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
except ImportError:
    print("=" * 60)
    print("cryptography 패키지가 없습니다. 먼저 설치하세요:")
    print()
    print("    pip install cryptography")
    print()
    print("설치 후 다시 실행하세요: python generate_vapid.py")
    print("=" * 60)
    sys.exit(1)

# P-256 키 쌍 생성
private_key = generate_private_key(SECP256R1())
public_key = private_key.public_key()

# 숫자값 추출
priv_numbers = private_key.private_numbers()
pub_numbers = priv_numbers.public_numbers

d = b64url(priv_numbers.private_value.to_bytes(32, 'big'))
x = b64url(pub_numbers.x.to_bytes(32, 'big'))
y = b64url(pub_numbers.y.to_bytes(32, 'big'))

# VAPID 공개키 (비압축 형식, 브라우저 구독용)
uncompressed = public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
vapid_public_key = b64url(uncompressed)

# 비공개키 JWK (Cloudflare Workers 환경 변수용)
private_jwk = json.dumps({
    "kty": "EC",
    "crv": "P-256",
    "d": d,
    "x": x,
    "y": y
}, separators=(',', ':'))

print()
print("=" * 60)
print("  VAPID 키 생성 완료!")
print("=" * 60)
print()
print("[ 1 ] index.html 에 붙여넣기 (VAPID_PUBLIC_KEY 상수)")
print("-" * 60)
print(vapid_public_key)
print()
print("[ 2 ] Cloudflare Workers 환경 변수 — VAPID_PUBLIC_KEY")
print("-" * 60)
print(vapid_public_key)
print()
print("[ 3 ] Cloudflare Workers 환경 변수 — VAPID_PRIVATE_JWK")
print("-" * 60)
print(private_jwk)
print()
print("=" * 60)
print("주의: 위 키를 안전한 곳에 저장하세요.")
print("비공개키(PRIVATE_JWK)는 절대 공개하지 마세요!")
print("=" * 60)
