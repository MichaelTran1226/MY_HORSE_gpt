# EquiFlow — Horse Training & Racing Club

Website: **https://horse-training.onrender.com/login**. React + NestJS + Prisma/PostgreSQL, triển khai trên Render và Supabase. Yêu cầu gốc: [subject.md](subject.md). Giao diện tiếng Anh, ưu tiên desktop. Tài liệu này dùng tiếng Việt để hướng dẫn nhóm.

## 1. Phạm vi hiện tại

| Vai trò | Chức năng sử dụng được |
|---|---|
| Club Manager | Tài khoản, khóa truy cập, hồ sơ/tiếp nhận ngựa, chuồng, audit log |
| Head Trainer | Giáo án, lịch/phân công, đánh giá, chỉ số chạy thử, biểu đồ tiến độ |
| Veterinarian | Khám, chấn thương 2D, khóa/mở khóa tập, lịch chăm sóc định kỳ |
| Groom / Stable Hand | Lịch được giao, phân bổ chuồng |
| Horse Owner | Yêu cầu tiếp nhận; hồ sơ, sức khỏe và huấn luyện của ngựa mình |

Dashboard tính số liệu từ API/database theo phạm vi tài khoản: ngựa, hạn chế tập, lịch sắp tới, tiếp nhận chờ duyệt, phân bố sức khỏe và chăm sóc đến hạn. Bấm **Refresh data** để lấy bản mới; đây không phải cập nhật realtime. Bản ghi [SAMPLE] được tính trong tổng và có thông báo riêng.

Ba flow REQUIRED đã có triển khai. Sơ đồ chấn thương dùng **2D** theo phạm vi thống nhất. Các mục **Planned / Optional extension** chưa hoạt động: dinh dưỡng, checklist chăm sóc, giao diện sự cố/vật tư, đăng ký thi đấu, tài chính. Không xem các mục này là tính năng đã hoàn thành.

Ảnh/video hiện nhập link HTTPS, chưa tải file. Access permissions chỉ hiển thị quyền cố định theo vai trò. Nhắc chăm sóc hiện là danh sách trong web, chưa gửi tự động. Chưa có đổi/quên mật khẩu; kết luận đủ điều kiện mở khóa, trùng lịch và sửa dữ liệu đồng thời còn cần hoàn thiện.

## 2. Tài khoản demo và mật khẩu

| Email đăng nhập | Vai trò |
|---|---|
| sample.manager@equiflow.example | Club Manager |
| sample.trainer@equiflow.example | Head Trainer |
| sample.vet@equiflow.example | Veterinarian |
| sample.groom@equiflow.example | Groom / Stable Hand |
| sample.owner@equiflow.example | Horse Owner 1 |
| sample.owner2@equiflow.example | Horse Owner 2 |

Mỗi account có mật khẩu ngẫu nhiên riêng. Trên máy đã tạo dữ liệu, mở **backend/.sample-credentials.cloud.json** để lấy mật khẩu website. Bản local dùng **backend/.sample-credentials.local.json**. File bị Git ignore và không có trong GitHub. Người clone repo mới phải tự seed database riêng để có tài khoản/mật khẩu riêng.

Email mẫu chỉ là tên đăng nhập, không nhận thư. Tài khoản được tạo sẵn và xác minh phục vụ demo nên không cần OTP hoặc mua domain. Quản lý chính vẫn giữ nguyên; mật khẩu cloud của quản lý chính nằm trong `backend/.manager-credentials.cloud.txt`.

Không đăng mật khẩu lên GitHub. Các account mẫu có quyền thật trong ứng dụng, bao gồm quản lý; chỉ chia sẻ cho người được phép thử dự án.

## 3. Dữ liệu mẫu và cách tạo

Bộ mẫu: **6 ngựa, 6 chuồng, 5 giáo án, 15 buổi tập, 10 kết quả chạy thử, 5 hồ sơ khám, 5 lịch chăm sóc**. 15 buổi gồm 10 hoàn thành, 3 chờ và 2 hủy. Hai chủ mỗi người có ba ngựa. Ngựa Aurora/Atlas FIT, Willow WATCH, Ember INJURED, Luna QUARANTINE và Orion PENDING.

Tên mang [SAMPLE], mã chip/chuồng mang SAMPLE-. Đây là dữ liệu giả lập được nhập chủ động, không phải hồ sơ thực tế hay hướng dẫn điều trị.

```powershell
# Từ thư mục gốc, đọc backend/.env
npm --prefix backend run seed:sample
# Chỉ dùng khi chủ động muốn seed cloud, đọc backend/.env.cloud
npm --prefix backend run seed:sample -- --cloud
```

Script chạy giao dịch, không xóa dữ liệu thật, không đổi mật khẩu quản lý chính. Chạy lại không nhân đôi hoặc ghi đè dữ liệu mẫu đã chỉnh. Giữ file mật khẩu; ngày mẫu tính theo lần tạo đầu, chạy lại không dời lịch. Không có seed tự động trong Docker/deploy. Không dùng reset database để làm lại demo.

## 4. Hướng dẫn thao tác

### Club Manager

1. **Staff accounts → Create staff / owner account**: nhập tên, email, mật khẩu và vai trò.
2. **Stall map**: tạo chuồng nếu cần.
3. **Horse registry → Register a horse**: tên, chip riêng biệt, giống, ngày sinh, màu, giới tính, chiều cao (hands), cân nặng (kg), chủ và chuồng.
4. Mở ngựa PENDING → **Review admission** → chọn chủ/chuồng → Admit hoặc Reject.
5. **Edit profile** sửa hồ sơ; **Audit Log** xem thao tác. Staff accounts có Lock/Unlock; không được tự khóa mình.

### Head Trainer

1. **Training Plans** → chọn ngựa ADMITTED đủ điều kiện → **Create training plan**.
2. Nhập mục tiêu, cự ly (m), cường độ, mặt sân và khoảng thời gian.
3. Mở giáo án → chọn ngày giờ, người phụ trách → **Schedule session**.
4. **Training calendar** xem ngày/tuần; **Training overview** xem tiến độ và điểm phong độ.
5. Mở buổi tập → **Record assessment / trial run** → nhận xét, điểm 1–10 → **Complete session**.
6. Nếu ghi chạy thử, nhập đủ thời gian hoàn thành (giây), tốc độ tối đa (km/h), nhịp tim trước/sau. Link video HTTPS tùy chọn.

### Veterinarian

1. **Herd health** → lọc sức khỏe → chọn ngựa.
2. **Record examination & injury** → chẩn đoán, điều trị, đơn thuốc nếu có và trạng thái. Với chấn thương, chọn vị trí 2D và mức độ.
3. **Activate training lock** → lý do → Lock training. INJURED/QUARANTINE trong hồ sơ khám cũng kích hoạt khóa.
4. Sau tái khám, lưu hồ sơ mới rồi **Release training lock** và lý do. Chỉ mở khi bác sĩ xác nhận đủ điều kiện; code hiện mới kiểm tra có hồ sơ sau thời điểm khóa, chưa kiểm tra đủ nội dung kết luận.
5. **Schedule care** tạo lịch tiêm phòng/tẩy giun/chăm sóc móng. Xong chọn **Mark complete**.

Khóa hủy các buổi chưa hoàn thành. Mở khóa không tự khôi phục buổi đã hủy. Ngựa WATCH chỉ được tập LIGHT.

### Groom / Stable Hand

**Training assignments** xem lịch giao cho mình; **Stall map** xem vị trí chuồng/ngựa. Các mục chăm sóc/dinh dưỡng/vật tư còn ghi Planned.

### Horse Owner

**My Horses** xem ngựa mình hoặc **Request horse admission**. **Health updates** xem khám/chăm sóc. **Training journal** xem giáo án, đánh giá, link video nếu có. Không được xem ngựa của chủ khác.

Các form thu gọn cần bấm tiêu đề để mở. Save lưu dữ liệu; thông báo Changes saved xác nhận thành công. Refresh tải lại dữ liệu; Retry thử lại khi lỗi. Sign out kết thúc phiên đăng nhập.

## 5. 15 tình huống demo với dữ liệu sẵn

Các thao tác ghi dữ liệu có tác dụng thật trên bộ mẫu. Danh sách này là kịch bản thực hành, không phải tuyên bố cả 15 đã được chạy tự động trên cloud.

| # | Account | Thao tác và kết quả mong đợi |
|---|---|---|
| 1 | manager | Overview: số ngựa/hạn chế/chờ duyệt khớp database |
| 2 | manager | Horse registry: tìm SAMPLE-EQ-1, mở Aurora |
| 3 | owner | My Horses: thấy Aurora, Willow, Luna; không thấy Atlas/Ember/Orion |
| 4 | owner2 | My Horses: thấy Atlas, Ember, Orion |
| 5 | manager | Mở Orion PENDING → Review admission → Admit |
| 6 | manager | Stall map: xem năm chuồng có ngựa, một chuồng trống trước khi duyệt Orion |
| 7 | trainer | Training overview: xem biểu đồ hai điểm đánh giá/ngựa đã có giáo án |
| 8 | trainer | Aurora: mở giáo án và các buổi đã hoàn thành |
| 9 | trainer | Aurora: xem đủ bốn chỉ số chạy thử trong buổi đã hoàn thành |
| 10 | groom | Training assignments: xem ba buổi chờ và hai buổi đã hủy trong ngày mẫu |
| 11 | trainer | Willow WATCH: tạo LIGHT hợp lệ; MODERATE/HEAVY bị chặn |
| 12 | vet | Ember: xem chẩn đoán và chấn thương foreleg; thử ghi thêm hồ sơ bằng bản đồ 2D |
| 13 | trainer | Ember/Luna bị khóa: không thể xếp hoặc hoàn thành buổi tập |
| 14 | vet | Preventive care: xem lịch đến hạn, đánh dấu một mục hoàn thành |
| 15 | vet → trainer → manager | Ember: tái khám, mở khóa, tạo buổi mới; manager kiểm tra Audit Log |

Để thử tạo dữ liệu mới: owner gửi admission; manager duyệt; trainer tạo giáo án/phân công; groom xem lịch; vet khóa; trainer kiểm tra bị chặn. Không nhập dữ liệu cá nhân thật vào bản ghi sample.

## 6. Kiến trúc và cấu trúc thư mục

```text
React/Vite → /api → NestJS (validation, session, RBAC) → Prisma → PostgreSQL
```

Production dùng một Docker service phục vụ frontend và API cùng origin. Cookie phiên HttpOnly/Secure/SameSite; database lưu mã băm token. Hiện dùng Supabase PostgreSQL, chưa dùng Supabase Auth cho đăng nhập.

| Thư mục/file | Vai trò |
|---|---|
| frontend/src/features/auth | Auth và khung workspace theo vai trò |
| frontend/src/features/workspace | Dashboard, hồ sơ, lịch, y tế, tài khoản, chuồng |
| backend/src/modules | Auth/accounts/horses/training/health/stables |
| backend/src/common | Guard phân quyền, Prisma, xử lý lỗi |
| backend/prisma | Schema và migration có phiên bản |
| backend/scripts | Bootstrap quản lý, seed sample |
| backend/test; frontend/tests | Unit/integration và browser tests |
| Dockerfile; render.yaml | Build và triển khai |
| docs | Kiến trúc, deploy và bằng chứng kiểm thử |

## 7. Cài đặt local

Cần Node.js 22.12+ hoặc Node 24, npm, PostgreSQL 16. Tạo database riêng tên equiflow. Có thể dùng PostgreSQL trực tiếp hoặc Docker. Máy dự án hiện có container equiflow-dev-postgres tại 127.0.0.1:55439; máy mới cần tự tạo server/database tương ứng.

```powershell
npm --prefix backend ci
npm --prefix frontend ci
# Chỉ copy nếu chưa có file; không ghi đè cấu hình đang dùng
Copy-Item backend/.env.example backend/.env
```

Sửa backend/.env: DATABASE_URL của database riêng, APP_ORIGIN=http://localhost:5173, PORT=3000. Thay CHANGE_ME bằng mật khẩu thật, URL-encode ký tự đặc biệt.

```powershell
cd backend
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run seed:sample
npm run start:dev
```

Terminal thứ hai, từ gốc:

```powershell
npm --prefix frontend run dev
```

Mở http://localhost:5173/login. Health API: http://localhost:3000/api/status. Vite proxy /api sang backend. Không đặt database credentials trong frontend.

Nếu muốn quản lý chính trên database mới: trước khi seed mẫu, đặt BOOTSTRAP_EMAIL và BOOTSTRAP_NAME trong môi trường, chạy `npm run bootstrap:manager` tại backend. Script từ chối nếu đã có quản lý. Mật khẩu sinh ngẫu nhiên lưu `.manager-credentials.local.txt`, không ghi đè file cũ.

## 8. Kiểm thử

```powershell
npm --prefix backend run build
npm --prefix backend test
npm --prefix frontend run build
npm --prefix frontend run lint
```

Integration test xóa dữ liệu test: tạo database riêng **equiflow_test**, cấu hình DATABASE_URL của terminal test vào database này rồi:

```powershell
cd backend
npm run prisma:deploy
npm run test:integration
cd ../frontend
npx playwright install chromium
npx playwright test
```

Không chạy test với database cloud dùng demo. Browser tests phụ thuộc fixtures integration, nên chạy integration trước mỗi lượt. Playwright đọc backend/.env rồi đổi tên database thành equiflow_test; nếu dùng server khác đặt TEST_DATABASE_URL tương ứng. Workflow `.github/workflows/verify.yml` có quy trình CI; chỉ kết luận CI pass khi đã xem kết quả thực tế.

## 9. Deploy

Dùng service **Horse-Training** trên Render, repo MichaelTran1226/MY_HORSE_gpt, nhánh main, Docker, build context ở gốc. Chi tiết: [docs/deployment.md](docs/deployment.md).

| Biến server | Giá trị/mục đích |
|---|---|
| DATABASE_URL | Supabase Session pooler 5432, sslmode=require, connection_limit=5 |
| APP_ORIGIN | https://horse-training.onrender.com, không có / cuối |
| NODE_ENV | production |
| TRUST_PROXY | 1 |
| EMAIL_API_KEY; EMAIL_FROM | Resend và sender đã xác minh nếu bật email OTP |

Health check /api/status. Startup chạy migration trước server. `.env.cloud` ở local không tự lên Render qua Git: phải cấu hình Environment của service. RENDER_API_KEY chỉ dùng công cụ triển khai, không cần đưa vào app.

Sau deploy kiểm tra health, đăng nhập/đăng xuất, reload trang sâu, số liệu và quyền owner. Sao lưu trước migration khi đã có dữ liệu; không chạy prisma migrate reset trên cloud.

## 10. Demo không mua domain và Google OAuth

**Dùng ngay:** sáu tài khoản mẫu bên trên; email chỉ làm định danh, không cần gửi thư. Không dùng OTP cố định hoặc tắt kiểm tra bảo mật để demo.

**Google OAuth:** khả thi với domain Render sẵn có, không cần mua domain riêng để bắt đầu demo. Cần Google OAuth Client ID/Secret, cấu hình Google provider trong Supabase, callback Supabase và URL chuyển về ứng dụng. Bật provider đơn thuần không tích hợp được với NestJS session hiện tại. Backend cần xác minh danh tính từ Supabase, ánh xạ người dùng và giữ RBAC; không cho client tự gán vai trò và không tự ghép tài khoản quản lý chỉ từ email chưa xác minh.

Hướng dẫn chính thức: [Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google), [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls). Google OAuth chưa được triển khai trong bản này. Google login cũng không thay thế dịch vụ email cho các thông báo khác.

## 11. Lỗi thường gặp và việc còn lại

| Hiện tượng | Cách xử lý |
|---|---|
| Deploy Prisma P1012 | Kiểm tra DATABASE_URL trong Render Environment |
| Build tìm requirements.txt | Chọn nhầm Python, phải dùng Docker |
| Email unavailable khi đăng ký | Thiếu sender/provider; demo bằng tài khoản cấp sẵn |
| Login thất bại | Kiểm tra đúng password cloud/local, khóa hoặc xác minh tài khoản |
| Owner thấy ít ngựa | Đúng phạm vi sở hữu, không phải mất dữ liệu |
| Không xếp lịch | Kiểm tra ADMITTED, khóa y tế, WATCH chỉ được LIGHT |
| Không hoàn thành buổi tập | Buổi hủy/đã hoàn thành, ngựa khóa hoặc thiếu bộ chỉ số |
| Không mở khóa | Cần hồ sơ tái khám sau thời điểm khóa |
| Chuồng không gán được | Chuồng đã có ngựa hoặc dữ liệu lựa chọn thay đổi |
| Mất mạng lúc lưu | Kiểm tra bản ghi đã lưu trước khi gửi lại để tránh trùng |
| Planned / Optional extension | Chức năng chưa mở, không phải lỗi tài khoản |

Cần tiếp tục hoàn thiện: email/Google theo lựa chọn triển khai, đổi/quên mật khẩu, trùng lịch, kết luận tái khám, chống gửi lặp, sửa đồng thời, chức năng optional, backup/restore và đo hiệu năng. [Validation](docs/validation.md) · [Delivery plan](docs/delivery-plan.md) · [Architecture decisions](docs/architecture-decisions.md).
