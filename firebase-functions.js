// ===== Firebase 연동 함수들 (Google Apps Script 대체) =====

// ===== 공지사항 관련 함수들 =====

// 공지사항 저장
async function saveAnnouncementToFirebase(announcement) {
    try {
        console.log('📤 Firebase에 공지사항 저장 시도:', announcement);
        
        const docRef = await window.firebase.addDoc(window.firebase.collection(window.db, 'announcements'), {
            ...announcement,
            createdAt: window.firebase.serverTimestamp(),
            updatedAt: window.firebase.serverTimestamp()
        });
        
        console.log('✅ Firebase 공지사항 저장 성공! ID:', docRef.id);
        return { 
            success: true, 
            message: '공지사항이 저장되었습니다.',
            id: docRef.id,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Firebase 공지사항 저장 실패:', error);
        return { 
            success: false, 
            error: '공지사항 저장 실패: ' + error.message 
        };
    }
}

// 공지사항 불러오기 (실시간)
function loadAnnouncementsFromFirebase() {
    try {
        console.log('📥 Firebase에서 공지사항 실시간 로딩 시작...');
        
        const q = window.firebase.query(
            window.firebase.collection(window.db, 'announcements'),
            window.firebase.orderBy('createdAt', 'desc')
        );
        
        // 실시간 리스너 등록
        const unsubscribe = window.firebase.onSnapshot(q, (querySnapshot) => {
            const announcements = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                announcements.push({
                    id: doc.id,
                    ...data,
                    // Firestore timestamp를 문자열로 변환
                    date: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                    comments: [] // 댓글은 별도 컬렉션에서 로드
                });
            });
            
            console.log('🔄 Firebase 공지사항 실시간 업데이트:', announcements.length, '개');
            
            // 전역 변수 업데이트
            window.announcements = announcements;
            
            // 화면에 표시
            if (typeof displayAnnouncements === 'function') {
                displayAnnouncements();
            }
        }, (error) => {
            console.error('❌ Firebase 공지사항 로딩 실패:', error);
        });
        
        // unsubscribe 함수를 전역으로 저장 (필요시 리스너 해제용)
        window.unsubscribeAnnouncements = unsubscribe;
        
    } catch (error) {
        console.error('❌ Firebase 공지사항 리스너 설정 실패:', error);
    }
}

// 공지사항 삭제
async function deleteAnnouncementFromFirebase(announcementId) {
    try {
        console.log('🗑️ Firebase에서 공지사항 삭제 시도:', announcementId);
        
        await window.firebase.deleteDoc(window.firebase.doc(window.db, 'announcements', announcementId));
        
        console.log('✅ Firebase 공지사항 삭제 성공!');
        return { success: true, message: '공지사항이 삭제되었습니다.' };
    } catch (error) {
        console.error('❌ Firebase 공지사항 삭제 실패:', error);
        return { success: false, error: '공지사항 삭제 실패: ' + error.message };
    }
}

// ===== 질문상담 관련 함수들 =====

// 질문 저장
async function saveQuestionToFirebase(question) {
    try {
        console.log('📤 Firebase에 질문 저장 시도:', question);
        
        const docRef = await window.firebase.addDoc(window.firebase.collection(window.db, 'questions'), {
            ...question,
            createdAt: window.firebase.serverTimestamp(),
            updatedAt: window.firebase.serverTimestamp()
        });
        
        console.log('✅ Firebase 질문 저장 성공! ID:', docRef.id);
        return { 
            success: true, 
            message: '질문이 저장되었습니다.',
            id: docRef.id
        };
    } catch (error) {
        console.error('❌ Firebase 질문 저장 실패:', error);
        return { 
            success: false, 
            error: '질문 저장 실패: ' + error.message 
        };
    }
}

// 질문 불러오기 (실시간)
function loadQuestionsFromFirebase() {
    try {
        console.log('📥 Firebase에서 질문 실시간 로딩 시작...');
        
        const q = window.firebase.query(
            window.firebase.collection(window.db, 'questions'),
            window.firebase.orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = window.firebase.onSnapshot(q, (querySnapshot) => {
            const questions = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                questions.push({
                    id: doc.id,
                    ...data,
                    date: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                });
            });
            
            console.log('🔄 Firebase 질문 실시간 업데이트:', questions.length, '개');
            
            // 전역 변수 업데이트
            window.questions = questions;
            
            // 화면에 표시
            if (typeof displayQuestions === 'function') {
                displayQuestions();
            }
        });
        
        window.unsubscribeQuestions = unsubscribe;
        
    } catch (error) {
        console.error('❌ Firebase 질문 리스너 설정 실패:', error);
    }
}

// ===== 사용자 관련 함수들 =====

// 사용자 정보 저장
async function saveUserToFirebase(userData) {
    try {
        console.log('📤 Firebase에 사용자 정보 저장 시도:', userData);
        
        const docRef = await window.firebase.addDoc(window.firebase.collection(window.db, 'users'), {
            ...userData,
            createdAt: window.firebase.serverTimestamp(),
            lastLogin: window.firebase.serverTimestamp()
        });
        
        console.log('✅ Firebase 사용자 정보 저장 성공! ID:', docRef.id);
        return { 
            success: true, 
            message: '사용자 정보가 저장되었습니다.',
            id: docRef.id
        };
    } catch (error) {
        console.error('❌ Firebase 사용자 정보 저장 실패:', error);
        return { 
            success: false, 
            error: '사용자 정보 저장 실패: ' + error.message 
        };
    }
}

// ===== 일정 관련 함수들 =====

// 일정 저장
async function saveCalendarToFirebase(calendarData) {
    try {
        console.log('📤 Firebase에 일정 저장 시도:', calendarData);
        
        const docRef = await window.firebase.addDoc(window.firebase.collection(window.db, 'calendar'), {
            ...calendarData,
            createdAt: window.firebase.serverTimestamp()
        });
        
        console.log('✅ Firebase 일정 저장 성공! ID:', docRef.id);
        return { 
            success: true, 
            message: '일정이 저장되었습니다.',
            id: docRef.id
        };
    } catch (error) {
        console.error('❌ Firebase 일정 저장 실패:', error);
        return { 
            success: false, 
            error: '일정 저장 실패: ' + error.message 
        };
    }
}

// 일정 불러오기
function loadCalendarFromFirebase() {
    try {
        console.log('📥 Firebase에서 일정 로딩 시작...');
        
        const q = window.firebase.query(
            window.firebase.collection(window.db, 'calendar'),
            window.firebase.orderBy('date', 'asc')
        );
        
        const unsubscribe = window.firebase.onSnapshot(q, (querySnapshot) => {
            const calendar = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                calendar.push({
                    id: doc.id,
                    ...data
                });
            });
            
            console.log('🔄 Firebase 일정 실시간 업데이트:', calendar.length, '개');
            
            // 전역 변수 업데이트
            window.calendar = calendar;
            
            // 화면에 표시 (달력 함수가 있다면)
            if (typeof displayCalendar === 'function') {
                displayCalendar();
            }
        });
        
        window.unsubscribeCalendar = unsubscribe;
        
    } catch (error) {
        console.error('❌ Firebase 일정 리스너 설정 실패:', error);
    }
}

// ===== 초기화 함수 =====

// Firebase 데이터 로딩 초기화 (샘플 데이터 없이!)
function initializeFirebaseData() {
    console.log('🚀 Firebase 데이터 로딩 초기화 시작...');
    
    // 전역 변수들을 빈 배열로 초기화 (샘플 데이터 없음!)
    window.announcements = [];
    window.questions = [];
    window.users = [];
    window.calendar = [];
    
    // Firebase에서 실시간 데이터 로딩 시작
    loadAnnouncementsFromFirebase();
    loadQuestionsFromFirebase();
    loadCalendarFromFirebase();
    
    console.log('✅ Firebase 초기화 완료 - 깨끗한 상태에서 시작!');
}

// 페이지 로드 시 Firebase 초기화
document.addEventListener('DOMContentLoaded', function() {
    // Firebase 초기화 대기 후 데이터 로딩
    setTimeout(initializeFirebaseData, 1000);
});

console.log('🔥 Firebase 연동 함수들 로드 완료!');
