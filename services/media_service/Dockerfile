FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

COPY services/common /app/services/common
COPY services/media_service /app/services/media_service

RUN pip install --no-cache-dir -r services/media_service/requirements.txt

EXPOSE 8030

CMD ["uvicorn", "services.media_service.app.main:app", "--host", "0.0.0.0", "--port", "8030"]



