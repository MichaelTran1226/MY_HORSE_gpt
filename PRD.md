# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRODUCT REQUIREMENTS DOCUMENT - PRD)

**Dự án**: EquiFlow — Horse Training & Racing Club Management System  
**Học phần**: SWP391 (Software Development Project)  
**Phiên bản**: v2.0.0 (Chuẩn hóa toàn diện theo NestJS, không phả hệ, không realtime)  
**Ngày cập nhật**: 23/09/2026  
**Trạng thái**: Approved & Aligned with subject.md  

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

### 1.1. Bối Cảnh & Vấn Đề Thực Tế (Problem Statement)
Các câu lạc bộ (CLB) huấn luyện và thi đấu đua ngựa chuyên nghiệp đòi hỏi sự phối hợp kỷ luật và chặt chẽ giữa nhiều bên chuyên môn. Tuy nhiên, hiện trạng vận hành tại nhiều cơ sở còn tồn tại bất cập:
1. **Dữ liệu phân mảnh & thủ công**: Bệnh án thú y, lịch tiêm phòng, định mức dinh dưỡng và nhật ký tập luyện thường được ghi chép rời rạc trên sổ tay hoặc file Excel.
2. **Nguy cơ tái phát chấn thương cao**: Thiếu sự kết nối thông tin giữa Bác sĩ thú y và Huấn luyện viên trưởng. Ngựa đang chấn thương vẫn có thể bị xếp vào các bài tập nặng gây nguy hiểm thể trạng.
3. **Thiếu minh bạch với Chủ sở hữu ngựa (Horse Owner)**: Chủ ngựa trả chi phí nuôi dưỡng lớn nhưng khó giám sát thể trạng, tiến độ huấn luyện và bảng kê chi phí định kỳ một cách trực quan, rõ ràng.
4. **Phân quyền và bảo mật**: Cần cơ chế kiểm soát truy cập theo vai trò (RBAC) nghiêm ngặt và nhật ký kiểm toán (Audit Log) để đảm bảo an toàn thông tin và tính minh bạch.

### 1.2. Mục Tiêu Sản Phẩm (Product Objectives)
Xây dựng nền tảng phần mềm web **EquiFlow** tập trung, chuẩn mực và hiện đại nhằm:
* **Số hóa trọn chu trình chăm sóc chiến mã**: Tiếp nhận ngựa vào CLB (Intake), bố trí chuồng, khẩu phần dinh dưỡng hàng ngày, theo dõi y tế chuyên sâu, giáo án huấn luyện chạy thử, cho đến khi đăng ký thi đấu giải.
* **Cơ chế an toàn tối cao "Training Lock"**: Trao quyền cho Bác sĩ thú y khóa tập luyện khẩn cấp trực tiếp trên hệ thống, tự động vô hiệu hóa việc xếp lịch bài tập nặng đối với ngựa chấn thương.
* **Phân quyền nghiêm ngặt 5 Actor & Cách ly dữ liệu Chủ ngựa**: Đảm bảo an toàn thông tin tuyệt đối giữa các bên tác nghiệp; mỗi chủ ngựa chỉ xem được dữ liệu của con ngựa mình sở hữu.

---

## 2. NGĂN XẾP CÔNG NGHỆ (TECH STACK)

* **Frontend**:
  * **React** `19.2.8` + **Vite** `8.3.0` + **TypeScript** `~6.0.2` (Target `ES2022`).
  * **Routing**: `react-router-dom` `^7.18.4` (bảng định tuyến tập trung tại `src/app/router.tsx`).
  * **Styling**: Pure CSS3 + CSS Modules (`*.module.css`) + W3C Design Tokens (`tokens.css`).
  * **Bộ icon**: Bộ icon vector nội bộ 73 glyphs (`icons.ts`) + Lucide React phụ trợ.
  * **Kiểm thử tĩnh & Linter**: `oxlint` `^1.81.0`.
  * **Quy chuẩn UI**: Không dùng Tailwind CSS, không dùng thư viện UI nặng (MUI, Ant Design).
* **Backend**:
  * **Node.js** `>= 20.19.0` (LTS) + **NestJS** `^10.x` / `^11.x` + **TypeScript**.
  * **ORM & Database**: **Prisma ORM** + **PostgreSQL** (Quản lý qua **Supabase** / Local PostgreSQL, hỗ trợ Custom Domain).
  * **Xác thực & Bảo mật**: `@nestjs/passport`, `@nestjs/jwt`, `bcrypt` (băm mật khẩu an toàn), Cookie HttpOnly.
  * **Validation & DTO**: `class-validator`, `class-transformer`.
  * **Tài liệu API**: `@nestjs/swagger` (OpenAPI Swagger UI tự động tại `/api/docs`).
  * **Phương thức giao tiếp**: RESTful JSON API tiêu chuẩn (Client Fetch wrapper tại `src/shared/lib/api.ts`). **Không sử dụng WebSocket hay Realtime push**.

---

## 3. NĂM (5) VAI TRÒ HỆ THỐNG (ACTORS)

Chuẩn hóa chính xác 100% theo tài liệu gốc `subject.md`:

### 3.1. Head Trainer (Huấn luyện viên Trưởng)
* Xem bảng tiến độ và biểu đồ thể lực tổng quan của toàn bộ chiến mã trong câu lạc bộ.
* Lập giáo án huấn luyện chi tiết (cự ly, khối lượng, mặt sân) theo từng giai đoạn cho từng con ngựa.
* Phân công lịch tập luyện hàng ngày cho đội ngũ chăm sóc và quản lý lượt chạy thử.
* Đánh giá phong độ, ghi nhận chỉ số buổi tập và đưa ra nhận xét chuyên môn sau mỗi buổi tập.
* Lựa chọn chiến mã và đăng ký tham gia các giải đua phù hợp.

### 3.2. Veterinarian (Bác sĩ Thú y)
* Xem sơ đồ trạng thái sức khỏe (Đủ điều kiện, Cần theo dõi, Chấn thương, Cách ly) của toàn bộ đàn ngựa trên giao diện chuồng trại.
* Ghi nhận hồ sơ khám bệnh, chẩn đoán chi tiết và cập nhật phác đồ điều trị/đơn thuốc.
* Đánh dấu vị trí chấn thương trên mô hình cơ/xương 3D của ngựa để theo dõi diễn biến phục hồi.
* Đặt lệnh **"Khóa huấn luyện" (Training Lock)** khẩn cấp đối với ngựa chấn thương để ngăn chặn xếp lịch bài tập nặng.
* Theo dõi và nhận thông báo tự động về lịch tiêm phòng, tẩy giun, kiểm tra móng (Farrier) định kỳ.

### 3.3. Groom / Stable Hand (Nhân viên Chăm sóc & Chuồng trại)
* Xem sơ đồ phân bổ vị trí chuồng trại và lịch trình sinh hoạt hàng ngày của từng con ngựa.
* Xem chi tiết khẩu phần ăn (ngũ cốc, cỏ, vitamin) được duyệt cho từng bữa trong ngày.
* Đánh dấu xác nhận hoàn thành công việc (Cho ăn, Vệ sinh chuồng, Tắm rửa, Ngâm chân nước đá).
* Gửi báo cáo sự cố đột xuất tại chuồng (Ngựa bỏ ăn, Có dấu hiệu đau bụng/sốt, Móng bị xước) kèm hình ảnh thực tế.
* Theo dõi danh sách vật tư (Thức ăn, Thuốc, Dụng cụ) tại khu vực phụ trách để đề xuất bổ sung.

### 3.4. Horse Owner (Chủ sở hữu Ngựa)
* Xem hồ sơ lý lịch và lịch sử thành tích thi đấu của ngựa thuộc sở hữu. *(Không theo dõi phả hệ)*.
* Theo dõi chỉ số sức khỏe, cân nặng và trạng thái sẵn sàng thi đấu được cập nhật từ lần khám gần nhất. *(Không theo dõi thời gian thực)*.
* Xem lịch trình tập luyện, video các buổi đua thử và nhật ký nhận xét từ HLV Trưởng.
* Nhận báo cáo tổng hợp chi phí nuôi dưỡng, y tế và doanh thu tiền thưởng định kỳ.

### 3.5. Club Manager (Quản lý Câu lạc bộ)
* Quản lý danh mục tổng (Danh sách ngựa, Danh sách nhân sự, Danh mục vật tư y tế & thức ăn).
* Phân quyền truy cập và chức năng thao tác (RBAC) cho từng vai trò trong hệ thống.
* Xem báo cáo tổng quan về hiệu suất huấn luyện, chi phí vận hành chuồng trại và doanh thu giải đấu.
* Theo dõi nhật ký thao tác hệ thống (Audit Log) để đảm bảo an toàn thông tin và tính minh bạch.

---

## 4. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

Hệ thống được tổ chức thành 5 luồng nghiệp vụ chuẩn:

### 4.1. Flow 1: Luồng Quản Lý Hồ Sơ & Lý Lịch Ngựa (BẮT BUỘC - REQUIRED)
* **FR-1.1 (Danh sách đàn ngựa)**: Hiển thị danh sách tổng thể ngựa với bộ lọc đa tiêu chí (Giống loài, Độ tuổi, Trạng thái sức khỏe, Vị trí chuồng trại).
* **FR-1.2 (Hồ sơ định danh cá thể - Horse Profile)**:
  * Quản lý thông tin định danh và đặc điểm cá thể của con ngựa: Mã số định danh / Mã chip, Tên chiến mã, Giống loài (Thoroughbred, Arabian...), Ngày sinh, Màu lông, Giới tính (Stallion, Mare, Gelding), Chiều cao (Hands), Cân nặng hiện tại, Ảnh đại diện.
  * *Lưu ý quy chuẩn: Tuyệt đối không theo dõi cây phả hệ 3 đời (Pedigree Tree) theo yêu cầu kiến trúc.*
* **FR-1.3 (Quy trình tiếp nhận ngựa mới - Horse Intake Flow)**:
  * Chủ ngựa gửi yêu cầu tiếp nhận gửi ngựa vào CLB (*Boarding Request*).
  * Club Manager xét duyệt hồ sơ, tiếp nhận chính thức và chỉ định ô chuồng.
  * Bác sĩ thú y thực hiện kiểm tra y tế đầu vào (*Initial Medical Checkup*) và cập nhật trạng thái thể lực ban đầu.
* **FR-1.4 (Gán quyền sở hữu - Owner Assignment)**:
  * Thiết lập và cập nhật chủ sở hữu hợp pháp cho từng con ngựa.
  * Đảm bảo tính toàn vẹn quyền sở hữu để hệ thống thực thi cách ly dữ liệu giữa các chủ ngựa.

### 4.2. Flow 2: Luồng Lập & Thực Hiện Giáo Án Huấn Luyện (BẮT BUỘC - REQUIRED)
* **FR-2.1 (Trình tạo giáo án - Training Plan Wizard)**:
  * HLV Trưởng thiết lập kế hoạch bài tập theo chu kỳ (Tuần / Tháng) với các tham số: Mục tiêu (Tăng tốc lực, Sức bền, Phục hồi), Cự ly tập (m), Khối lượng bài tập, Mặt sân tập (Cát ướt, Cỏ tự nhiên, Đường tập tổng hợp).
* **FR-2.2 (Lịch tập luyện hàng ngày - Training Calendar)**:
  * Bảng lịch trực quan (Day/Week view) phân công bài tập cho từng con ngựa và chỉ định nhân viên/jockey phụ trách.
* **FR-2.3 (Quản lý lượt chạy thử - Trial Runs)**:
  * Ghi nhận kết quả chạy thử: Thời gian hoàn thành (giây, phần trăm giây), Vận tốc tối đa (km/h), Tần số tim trước và sau bài tập, Video ghi hình lượt chạy.
* **FR-2.4 (Đánh giá phong độ & Nhật ký)**:
  * HLV Trưởng nhập nhận xét chuyên môn, chấm điểm phong độ (1–10) sau mỗi buổi tập; hệ thống trực quan hóa biểu đồ thể lực theo từng đợt đánh giá.

### 4.3. Flow 3: Luồng Quản Lý Y Tế & Xử Lý Chấn Thương (BẮT BUỘC - REQUIRED)
* **FR-3.1 (Sơ đồ sức khỏe đàn ngựa - Health Overview)**:
  * Phân loại trực quan toàn bộ đàn ngựa thành 4 mã màu chuẩn:
    1. **Fit** (Đủ điều kiện): Màu xanh rêu (`#3e7048`) — Thể lực tốt, sẵn sàng tập luyện và thi đấu.
    2. **Watch** (Cần theo dõi): Màu vàng hổ phách (`#966221`) — Chỉ tập nhẹ, hạn chế vận động mạnh.
    3. **Injured** (Chấn thương - KHÓA TẬP): Màu đỏ (`#ab4f43`) — Đang chấn thương, kích hoạt lệnh Training Lock.
    4. **Quarantine** (Cách ly y tế): Màu tím thạch anh (`#736789`) — Cách ly tại chuồng riêng, cấm tiếp xúc đàn.
* **FR-3.2 (Bệnh án & Đơn thuốc - Medical Records)**:
  * Ghi nhận lịch sử khám chữa bệnh, triệu chứng lâm sàng, chẩn đoán, phác đồ điều trị, đơn thuốc và thời gian ngưng thuốc (*Withdrawal period*) trước giải đấu.
* **FR-3.3 (Bản đồ chấn thương - Interactive Injury Map)**:
  * Giao diện mô hình cơ/xương của ngựa cho phép Bác sĩ click chọn vị trí chấn thương (Chân trước, Khớp cổ chân, Lưng, Vai...), ghi nhận mức độ nghiêm trọng và diễn biến hồi phục.
* **FR-3.4 (Cơ chế KHÓA HUẤN LUYỆN - Training Lock System)**:
  * Khi Bác sĩ kích hoạt lệnh Khóa tập: Hệ thống lập tức đổi trạng thái ngựa sang *Injured*, hiển thị banner cảnh báo đỏ.
  * Phân hệ Huấn luyện (Flow 2) bị vô hiệu hóa hoàn toàn đối với con ngựa này: Nút tạo bài tập bị khóa (`disabled`), tích hợp component `DisabledHint` hiển thị lý do y khoa. HLV Trưởng không thể xếp lịch bài tập nặng cho đến khi Bác sĩ làm xét nghiệm tái khám và bấm "Release Lock".
* **FR-3.5 (Lịch chăm sóc y tế định kỳ - Care Schedule)**:
  * Quản lý lịch nhắc hẹn tiêm vắc-xin, tẩy giun sán và kiểm tra móng (Farrier inspection) định kỳ; tự động gửi thông báo đến Bác sĩ và Quản lý.

### 4.4. Flow 4: Luồng Chăm Sóc Chuồng Trại & Dinh Dưỡng Hàng Ngày (MỞ RỘNG - OPTIONAL)
* **FR-4.1 (Sơ đồ chuồng trại - Stall Map)**:
  * Trực quan hóa sơ đồ dãy chuồng (Khu A, Khu B, Khu Cách ly), hiển thị tên ngựa, ảnh và trạng thái hiện tại trong từng ô chuồng.
* **FR-4.2 (Khẩu phần dinh dưỡng - Feeding Rations)**:
  * Thiết lập định mức thức ăn cho từng con theo bữa (Sáng, Trưa, Tối) gồm: Cỏ khô (Timothy/Alfalfa), Ngũ cốc yến mạch, Hạt năng lượng, Vitamin và chất điện giải.
* **FR-4.3 (Checklist công việc Groom - Task Execution)**:
  * Giao diện tối ưu di động cho Groom tích chọn hoàn thành nhiệm vụ: Cho ăn đúng giờ, Dọn rửa chuồng, Thay rơm lót, Tắm chải lông, Ngâm chân nước đá sau tập.
* **FR-4.4 (Báo cáo sự cố chuồng trại - Incident Reporting)**:
  * Cho phép Groom gửi báo cáo khẩn cấp khi phát hiện dấu hiệu bất thường (Ngựa bỏ ăn, sốt cao, có dấu hiệu đau bụng colic, chấn thương móng) kèm ảnh chụp thực tế. Ảnh được lưu trữ trực tiếp trên Supabase Storage.
* **FR-4.5 (Quản lý vật tư tiêu hao - Supplies)**:
  * Theo dõi số lượng tồn kho thức ăn, thuốc thú y thông dụng tại khu vực chuồng và gửi đề xuất nhập thêm vật tư tới Club Manager.

### 4.5. Flow 5: Luồng Đăng Ký Thi Đấu & Báo Cáo Thành Tích (MỞ RỘNG - OPTIONAL)
* **FR-5.1 (Đăng ký giải đua - Race Entry)**:
  * Danh mục các giải thi đấu sắp diễn ra; HLV kiểm tra điều kiện sức khỏe (chỉ cho phép ngựa đạt chuẩn *Fit*, không bị Training Lock) và lập danh sách ngựa đăng ký tham gia.
* **FR-5.2 (Bảng kết quả & Thành tích - Race Results)**:
  * Cập nhật kết quả chung cuộc giải đua (Thứ hạng, Thời gian đua, Huy chương, Tiền thưởng đạt được) và lưu vào hồ sơ trọn đời của ngựa.
* **FR-5.3 (Báo cáo tài chính cho Chủ ngựa - Owner Statement)**:
  * Tự động tổng hợp bảng sao kê chi phí hàng tháng (Phí nuôi dưỡng, Thức ăn bổ sung, Chi phí y tế thú y, Lệ phí giải đua) đối trừ với tiền thưởng giải đấu đạt được.

---

## 5. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 5.1. Hiệu Năng & Tốc Độ (Performance)
* Thời gian phản hồi API NestJS: **< 200ms** trong điều kiện mạng nội bộ / cloud tiêu chuẩn.
* Thời gian tải trang ban đầu (First Contentful Paint - FCP): **< 1.2s**; điều hướng các trang SPA qua React Router **< 150ms**.
* Máy chủ phát triển Vite: Khởi động tức thì (**< 300ms**).

### 5.2. Bảo Mật & Toàn Vẹn Dữ Liệu (Security & Data Integrity)
* **Mật khẩu an toàn**: Mật khẩu băm chuẩn **BCrypt** độ an toàn cao.
* **Quy trình xác minh OTP qua Email**: Đăng ký và Quên mật khẩu **100% sử dụng mã OTP 6 số gửi về email** có thời hạn hiệu lực (5 phút).
* **Cách ly dữ liệu Chủ ngựa (Owner Isolation)**:
  * Client: Chặn điều hướng bằng Guard, tự chuyển về `/forbidden-403`.
  * Server (NestJS): Guard và Service kiểm tra quyền sở hữu (`ownerId === currentUser.id`). Chủ ngựa tuyệt đối không thể truy xuất dữ liệu của ngựa khác qua việc thay đổi ID trên URL.
* **Nhật ký kiểm toán (Audit Trail)**: Mọi thao tác nhạy cảm (Tạo tài khoản, Bật/Tắt Training Lock, Sửa bệnh án, Tiếp nhận ngựa) đều được tự động ghi nhận vào bảng `audit_logs` gồm: `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `timestamp`.
* **Cơ chế truy vấn**: Toàn bộ dữ liệu cập nhật theo lượt và truy vấn REST API tiêu chuẩn (On-demand query khi người dùng vào màn hình hoặc bấm làm mới). **Không sử dụng kết nối liên tục WebSocket hay Realtime push**.

### 5.3. Trải Nghiệm Người Dùng & Chuẩn Mĩ Thuật (UI/UX Pro Max & Accessibility)
* **Phong cách chủ đạo**: *Modern Heritage Equestrian* — Kết hợp giữa nét sang trọng, lịch lãm của môn thể thao đua ngựa truyền thống và sự khoa học, sắc nét của công nghệ quản trị đương đại.
* **Hệ thống bố cục Bento Box Grid (Apple-Style SaaS)**:
  * Ứng dụng cho trang Dashboard và trang Chi Tiết Hồ Sơ Ngựa (Horse Detail).
  * Các khối nội dung mô-đun hóa bất đối xứng: thẻ KPI (1x1), lịch trình ngày (2x1), sơ đồ chuồng trại / bệnh án (2x2) với bo góc mềm mại `--bento-r: 20px`, viền mảnh và bóng đổ tinh tế (`--bento-shadow`).
* **Bảng dữ liệu Data-Dense Dashboard**:
  * Ứng dụng cho danh sách tổng thể đàn ngựa, danh mục thuốc thú y và lịch trực.
  * Bố cục lưới 12 cột, chiều cao hàng chuẩn `--table-row-h: 40px`, tiêu đề cố định (sticky header), cuộn ngang an toàn trên mobile (`overflow-x: auto`).
* **Chuẩn phông chữ kép**:
  * Phông giao diện chính: **`Manrope`** (hình học hiện đại, hỗ trợ tiếng Anh 100% toàn diện).
  * Phông số liệu bảng biểu: **`DM Sans`** (kích hoạt `tabular-nums` giúp các con số luôn thẳng hàng).
* **Màu sắc & Chuẩn tương phản WCAG AAA**:
  * Màu xanh rêu Olive `--brand` (`#315d45`), đỏ Burgundy `--accent` (`#8C2F39`), và màu chữ than chì `--ink` (`#2B2E33` đạt tương phản **13.6:1 WCAG AAA** trên nền trắng).
  * Bốn mã màu y tế chiến mã: **Fit** (`#3e7048`), **Watch** (`#966221`), **Injured** (`#ab4f43`), **Quarantine** (`#736789`).
* **Bốn (4) trạng thái bắt buộc trên mọi màn hình**: *Loading State (Skeleton CLS=0)*, *Empty State*, *Error State (Banner + Retry)*, và *Permission Blocked State (DisabledHint)*.
* **Ngôn ngữ giao diện**: Toàn bộ nhãn trường, nút bấm, thông báo chuẩn hóa **100% Tiếng Anh**.

