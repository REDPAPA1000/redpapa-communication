import re

# Read the file
with open('d:/project/2026KIS/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Preserve local announcements when remote data is empty
old_code = """                        // Google Sheets가 비어있으면 로컬 데이터와 병합하지 않고 빈 배열 유지
                        announcements = [];
                        localStorage.setItem('announcements', JSON.stringify(announcements));
                        console.log('📋 공지사항: Google Sheets에 데이터 없음');"""

new_code = """                        // Google Sheets가 비어있으면 로컬 데이터를 유지 (덮어쓰기 방지)
                        if (announcements.length === 0) {
                             console.log('📋 공지사항: Google Sheets 및 로컬 데이터 없음');
                        } else {
                             console.log('📋 공지사항: Google Sheets가 비어있어 로컬 데이터 유지 (' + announcements.length + '개)');
                        }"""

content = content.replace(old_code, new_code)

# Write back
with open('d:/project/2026KIS/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed persistence bug - local data will now be preserved when remote is empty")
