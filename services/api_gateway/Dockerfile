FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

COPY services/common /app/services/common
COPY services/api_gateway /app/services/api_gateway

RUN pip install --no-cache-dir -r services/api_gateway/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "services.api_gateway.app.main:app", "--host", "0.0.0.0", "--port", "8000"]



