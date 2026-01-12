# --- Mobile UI (PWA) ---
mobile-ui-install:
	cd packages/bickford-mobile-ui && npm install

mobile-ui-dev:
	cd packages/bickford-mobile-ui && npm run dev

mobile-ui-build:
	cd packages/bickford-mobile-ui && npm run build

mobile-ui-preview:
	cd packages/bickford-mobile-ui && npm run preview
# Bickford Automation Makefile

up:
	docker-compose up --build

down:
	docker-compose down

status:
	docker-compose ps

logs:
	docker-compose logs --tail=50

restart:
	docker-compose restart

health:
	curl -f http://localhost:3000/api/ready || echo "API not healthy"
