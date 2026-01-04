FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

COPY services/common /app/services/common
COPY services/auth_service /app/services/auth_service

RUN pip install --no-cache-dir -r services/auth_service/requirements.txt

EXPOSE 8010

CMD ["uvicorn", "services.auth_service.app.main:app", "--host", "0.0.0.0", "--port", "8010"]



