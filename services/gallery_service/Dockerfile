FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

COPY services/common /app/services/common
COPY services/gallery_service /app/services/gallery_service

RUN pip install --no-cache-dir -r services/gallery_service/requirements.txt

EXPOSE 8020

CMD ["uvicorn", "services.gallery_service.app.main:app", "--host", "0.0.0.0", "--port", "8020"]



