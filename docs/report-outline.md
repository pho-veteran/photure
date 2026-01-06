### **OUTLINE BÁO CÁO ĐỒ ÁN LINUX**

> **📝 NOTES:**
> - **Language:** Sử dụng tiếng Anh cho toàn bộ báo cáo.
> - **Diagrams:** Sử dụng Mermaid diagrams cho các sơ đồ kiến trúc, flowcharts.
> - **Introduction & Conclusion:** Giữ ngắn gọn, súc tích (mỗi phần 1-2 trang).

**Tên đề tài:**  
**DEPLOYING PHOTURE - A MICROSERVICES PHOTO MANAGEMENT PLATFORM TO DIGITAL OCEAN USING DOCKER-COMPOSE, NGINX, AND GITLAB CI/CD**

**Cấu trúc báo cáo:**

1. **INTRODUCTION**  
2. **Chapter 1: OVERVIEW**  
   1.1. Programming Languages  
   1.2. Frameworks & Libraries  
   1.3. Other Technologies  
3. **Chapter 2: INFRASTRUCTURE DESIGN & IMPLEMENTATION**  
   2.1. Infrastructure Design Analysis  
   2.2. Server Setup & Provisioning (setup-droplet.sh)  
   2.3. Design Implementation  
4. **Chapter 3: RESULT**  
5. **CONCLUSION**  
6. **REFERENCE DOCUMENTS**  
7. **APPENDICES (Optional)**  

---

### **MÔ TẢ CHI TIẾT TỪNG PHẦN**

#### **1. INTRODUCTION**

- **1.1. Giới thiệu ứng dụng Photure:**  
  **Photure** là một nền tảng quản lý ảnh hiện đại, cloud-ready, được thiết kế để lưu trữ và tổ chức ảnh một cách an toàn và có khả năng mở rộng cao. Ứng dụng được xây dựng theo kiến trúc **microservices**, bao gồm:
  - **Frontend (React + TypeScript + Vite):** Giao diện người dùng responsive với dark/light theme, drag-and-drop upload.
  - **API Gateway (FastAPI):** Điểm vào duy nhất cho tất cả các request, xác thực JWT và điều phối đến các service.
  - **Auth Service:** Xử lý xác thực người dùng thông qua Clerk, xác minh token JWT.
  - **Gallery Service:** Quản lý metadata ảnh (CRUD), lưu trữ trong MongoDB.
  - **Media Service:** Quản lý file binary (upload, serve, delete), lưu trữ trên server volume.
  - **MongoDB:** Cơ sở dữ liệu NoSQL lưu trữ thông tin ảnh.
  - **Nginx:** Reverse proxy, phục vụ static files và điều hướng API requests.

- **1.2. Lý do chọn đề tài:**  
  Xu hướng sử dụng microservices, container hóa và CI/CD trong phát triển phần mềm hiện đại. Việc triển khai lên cloud (Digital Ocean) giúp tận dụng khả năng mở rộng linh hoạt, quản lý dễ dàng và chi phí hợp lý cho dự án cá nhân.

- **1.3. Mục tiêu đồ án:**  
  - Xây dựng và triển khai hệ thống microservices Photure sử dụng Docker & Docker Compose.  
  - Thiết lập CI/CD pipeline tự động với GitLab để build, push images và deploy.  
  - Cấu hình Nginx làm reverse proxy phục vụ frontend và điều hướng API.  
  - Viết script tự động hóa việc setup server (setup-droplet.sh).  
  - Deploy toàn bộ hệ thống lên Digital Ocean Droplet.

- **1.4. Phạm vi đồ án:**  
  - **6 services:** api-gateway, auth-service, gallery-service, media-service, frontend (nginx), mongodb.  
  - GitLab CI/CD pipeline với các stage: build, push, deploy.  
  - Nginx reverse proxy với static file serving.  
  - Digital Ocean Droplet làm production server.  
  - Bảo mật: UFW firewall, SSH key-based authentication, user isolation.

- **1.5. Bố cục báo cáo:**  
  Giới thiệu ngắn gọn các chương sẽ trình bày.

---

#### **2. Chapter 1: OVERVIEW**

- **1.1. Programming Languages:**  
  - **TypeScript (5.8.3):** Frontend development với type safety.  
  - **Python (3.11):** Backend microservices.  
  - **Bash:** Script tự động hóa setup server.

- **1.2. Frameworks & Libraries:**  
  - **React (19.1.0):** UI Framework cho frontend SPA.  
  - **Vite (7.0.0):** Build tool và dev server.  
  - **TailwindCSS (4.1.11):** Utility-first CSS framework.  
  - **Radix UI:** Accessible component library.  
  - **FastAPI (0.110.0):** Async Python API framework cho backend services.  
  - **Motor (3.6.0):** Async MongoDB driver.  
  - **Pydantic (2.11.2):** Data validation.  
  - **Clerk (React + Backend):** Authentication & user management.

- **1.3. Other Technologies:**  
  - **Digital Ocean Droplet:** Cloud VPS hosting.  
  - **Docker & Docker Compose:** Container hóa và orchestration.  
  - **Nginx:** Reverse proxy, static file serving.  
  - **GitLab CI/CD:** Automated pipeline (build, push, deploy).  
  - **MongoDB (7.0):** NoSQL database cho photo metadata.  
  - **SSH Key-based Authentication:** Secure server access.  
  - **UFW Firewall:** Network security.

---

#### **3. Chapter 2: INFRASTRUCTURE DESIGN & IMPLEMENTATION**

- **2.1. Infrastructure Design Analysis:**  
  - **System Architecture Diagram:** Sơ đồ kiến trúc hệ thống microservices Photure.  
  - **Service Communication Flow:** Luồng giao tiếp giữa các services (User → Nginx → API Gateway → Auth/Gallery/Media Services → MongoDB).  
  - **Docker Network Topology:** Mô tả docker network bridge, cách các containers giao tiếp nội bộ.  
  - **CI/CD Pipeline Flow:** Luồng từ Git push → GitLab → Build Images → Push Registry → SSH Deploy → Docker Compose Up.

- **2.2. Server Setup & Provisioning (setup-droplet.sh):**  
  Phân tích chi tiết script `setup-droplet.sh` - tự động hóa việc chuẩn bị server:

  - **2.2.1. Cài đặt Docker & Docker Compose:**  
    - Thêm Docker GPG key và repository.  
    - Cài đặt `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`, `docker-compose-plugin`.  
    - Cài đặt Docker Compose standalone binary.

  - **2.2.2. Tạo và cấu hình user `deploy`:**  
    ```bash
    useradd -m -s /bin/bash deploy
    usermod -aG docker deploy
    usermod -aG sudo deploy
    ```
    - Tạo user riêng cho deployment (không dùng root).  
    - Thêm vào group `docker` để chạy containers.  
    - Cấu hình sudoers cho phép chạy docker không cần password.

  - **2.2.3. Cấu hình SSH cho user deploy:**  
    - Copy SSH authorized_keys từ root sang deploy user.  
    - Thiết lập đúng permissions (700 cho .ssh, 600 cho authorized_keys).

  - **2.2.4. Tạo cấu trúc thư mục ứng dụng:**  
    ```bash
    mkdir -p /opt/photure/data/mongodb
    mkdir -p /opt/photure/data/uploads
    mkdir -p /opt/photure/logs
    ```
    - `/opt/photure`: Thư mục gốc của ứng dụng.  
    - `/opt/photure/data/mongodb`: Volume cho MongoDB data.  
    - `/opt/photure/data/uploads`: Volume cho uploaded photos.  
    - `/opt/photure/logs`: Nginx và application logs.

  - **2.2.5. Cấu hình Firewall (UFW):**  
    ```bash
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
    ```
    - Chặn tất cả incoming traffic mặc định.  
    - Chỉ mở ports: 22 (SSH), 80 (HTTP), 443 (HTTPS).

  - **2.2.7. Disable system Nginx:**  
    - Tắt nginx hệ thống để nhường port 80/443 cho Docker container.

- **2.3. Design Implementation:**  
  
  - **2.3.1. Dockerfiles:**  
    Giải thích Dockerfile cho từng service:
    - **auth-service:** Python base image, copy code, install requirements, expose port 8010.
    - **gallery-service:** Python base image, MongoDB connection, expose port 8020.
    - **media-service:** Python base image, file upload handling, expose port 8030.
    - **api-gateway:** Python base image, routing logic, expose port 8000.
    - **nginx:** Nginx Alpine base, copy static build và nginx.conf.

  - **2.3.2. Docker Compose Configuration:**  
    Phân tích `docker-compose.prod.yml`:
    - **Services:** mongodb, auth-service, media-service, gallery-service, api-gateway, nginx.
    - **Networks:** photure_network (bridge, subnet 172.20.0.0/16).
    - **Volumes:** MongoDB data, uploads, logs.
    - **Environment Variables:** Quản lý secrets qua biến môi trường.
    - **Port Binding:** Chỉ expose localhost cho internal services, public port 80 cho nginx.

  - **2.3.3. GitLab CI/CD Configuration (.gitlab-ci.yml):**  
    - **Stages:** build, push, deploy.
    - **Build stage:** Build Docker images cho từng service.
    - **Push stage:** Push images lên GitLab Container Registry.
    - **Deploy stage:** SSH vào server, pull images mới, docker-compose up -d.

  - **2.3.4. Nginx Configuration:**  
    - Serve static files từ frontend build.
    - Proxy `/api/*` requests đến api-gateway.
    - CORS headers configuration.
    - Gzip compression.

  - **2.3.5. Security Configuration:**  
    - SSH key-based authentication.
    - UFW firewall rules.
    - MongoDB chỉ bind localhost.
    - Environment variables cho secrets.

---

#### **4. Chapter 3: RESULT**

- **3.1. Hệ thống sau triển khai:**  
  - Screenshots giao diện Photure: Login, Gallery view, Upload modal.  
  - Terminal output: `docker ps` hiển thị 6 containers running.  
  - Hệ thống accessible qua domain/IP public.

- **3.2. Kết quả CI/CD Pipeline:**  
  - Screenshots GitLab pipeline thành công (build → push → deploy).  
  - Demo: Push code → Tự động deploy trong vài phút.  
  - Container Registry với các images đã push.

- **3.3. Kết quả bảo mật:**  
  - UFW status: chỉ mở ports 22, 80, 443.  
  - MongoDB không expose ra public internet.  
  - SSH chỉ accept key-based authentication.

- **3.4. Bài học kinh nghiệm & khó khăn:**  
  - Vấn đề gặp phải: Docker networking, environment variables, CORS, file permissions.  
  - Cách giải quyết từng vấn đề.  
  - Tips tối ưu CI/CD pipeline.

---

#### **5. CONCLUSION**

- Tóm tắt kết quả đạt được: Triển khai thành công hệ thống Photure với 6 services trên Digital Ocean.  
- Ý nghĩa của đồ án: Áp dụng kiến thức Linux, Docker, CI/CD vào dự án thực tế.  
- Hướng phát triển trong tương lai:
  - Thêm SSL/HTTPS với Certbot.
  - Horizontal scaling với Docker Swarm hoặc Kubernetes.
  - Monitoring với Prometheus + Grafana.
  - CDN cho static assets và images.

---

#### **6. REFERENCE DOCUMENTS**

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Digital Ocean Droplet Documentation](https://docs.digitalocean.com/products/droplets/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Clerk Authentication](https://clerk.com/docs)
- [UFW Firewall](https://help.ubuntu.com/community/UFW)

---

#### **7. APPENDICES (Optional)**

- **A.1.** Source code: [setup-droplet.sh](../scripts/setup-droplet.sh)  
- **A.2.** Docker Compose files: [docker-compose.dev.yml](../docker-compose.dev.yml), [docker-compose.prod.yml](../docker-compose.prod.yml)  
- **A.3.** Nginx configuration: [nginx.conf](../nginx/nginx.conf)  
- **A.4.** GitLab CI/CD: `.gitlab-ci.yml`  
- **A.5.** Link GitLab repository