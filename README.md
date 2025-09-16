# HCMUS Schedule to Google Calendar 📅

Đây là một UserScript giúp tự động hóa việc thêm **Thời khóa biểu** từ trang portal của **Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM** vào **Google Calendar** chỉ với một cú nhấp chuột.

## ✨ Tính năng

* **Tính giờ chính xác**: Tự động nhận diện lịch học của **Cơ sở 1 (Nguyễn Văn Cừ)** và **Cơ sở 2 (Linh Trung)** để áp dụng đúng khung giờ của từng cơ sở.
* **Thông minh**: Xử lý được các ca học Thực hành/Bài tập có giờ lẻ (2.5, 3.5, 7.5,...) vô cùng rối não.
* **Đúng tuần học**: Xác định chính xác tuần học đầu đầu tiên của môn đó.
* **Tính toán số buổi còn lại**: Tự động giảm số buổi học lặp lại nếu học kỳ đã bắt đầu được một thời gian.
* **Đầy đủ thông tin**: Tự động thêm **Mã Môn Học**, **Lớp/Nhóm** vào phần mô tả của sự kiện trên Google Calendar.
* **Giao diện thân thiện**: Tích hợp một cột "Google Calendar" vào bảng TKB với các nút bấm rõ ràng. Có thể nhấp vào tiêu đề cột để tải lại thông tin.

## ⚙️ Cài đặt

Để sử dụng, bạn cần thực hiện 2 bước:

### Bước 1: Cài đặt Trình quản lý UserScript

Đây là một tiện ích mở rộng (extension) cho trình duyệt để quản lý các script như thế này. Hãy chọn **một trong các** trình quản lý sau tùy theo trình duyệt bạn đang sử dụng:

* **Tampermonkey** (Phổ biến nhất, hỗ trợ nhiều trình duyệt)
    * [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    * [Firefox](https://addons.mozilla.org/vi/firefox/addon/tampermonkey/)
    * [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
    * [Safari](https://www.tampermonkey.net/?browser=safari)

* **Violentmonkey** (Một lựa chọn mã nguồn mở phổ biến khác)
    * [Chrome](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
    * [Firefox](https://addons.mozilla.org/vi/firefox/addon/violentmonkey/)
    * [Edge](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddgclojhaiejeojjdik)

### Bước 2: Cài đặt Script

1.  **[NHẤP VÀO ĐÂY ĐỂ CÀI ĐẶT SCRIPT]([link](https://github.com/nvhl/HCMUS-Schedule-to-Google-Calendar/raw/refs/heads/main/HCMUS-Schedule-to-Google-Calendar.user.js))**
2.  Sau khi nhấp vào, trình quản lý userscript (ví dụ: Tampermonkey) sẽ mở ra một tab mới.
3.  Nhấp vào nút **Install** để xác nhận cài đặt.

Vậy là xong!

## 🚀 Hướng dẫn sử dụng

1.  Truy cập vào trang **Kết Quả ĐKHP** trên portal của trường.
    * Link: `https://new-portal[số].hcmus.edu.vn/SinhVien.aspx?pid=212`
2.  Script sẽ tự động chạy và thêm cột **Google Calendar** vào cuối bảng thời khóa biểu.
3.  Tại dòng của môn học bạn muốn thêm, nhấp vào nút **"Thêm vào lịch"**.
4.  Một tab Google Calendar mới sẽ mở ra với toàn bộ thông tin đã được điền sẵn. Hãy kiểm tra lại, chỉnh sửa nếu cần và nhấn **Lưu (Save)**.
5.  **Để tải lại các link**, chỉ cần nhấp vào tiêu đề cột **Google Calendar**.

## 🔧 Tùy chỉnh (Tùy chọn)

Nếu học kỳ của bạn có số tuần khác 15, bạn có thể dễ dàng thay đổi:
1.  Mở trình duyệt, nhấp vào biểu tượng Tampermonkey -> **Dashboard**.
2.  Tìm script `HCMUS Schedule to Google Calendar` và nhấp vào biểu tượng chỉnh sửa.
3.  Tìm dòng `const SO_TUAN_HOC_DEFAULT = 15;` và thay đổi số `15` thành số tuần mong muốn.
4.  Lưu lại (Ctrl + S).
