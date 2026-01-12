build-all:
	npm install --workspaces
	npm run build

# One-command, deterministic completion pipeline.
# - Always: install deps, build, test, generate+verify+archive bid pack
# - Optional: enrich bid_out with SAM.gov notice if SAMGOV_NOTICE_ID is set
#   and a SAM.gov API key is available (SAMGOV_API_KEY or SAMGOV_API_KEY_PATH).
complete:
	npm install --workspaces
	npm run build
	npm test
	$(MAKE) bid-archive
	@if [ -n "$$SAMGOV_NOTICE_ID" ]; then \
		echo "SAMGOV_NOTICE_ID set; attempting SAM.gov enrichment..."; \
		npm run bid:enrich:samgov -- --noticeId "$$SAMGOV_NOTICE_ID" --out bid_out && \
		$(MAKE) bid-verify && \
		sha256sum bid_pack.tar.gz > bid_pack.tar.gz.sha256; \
	else \
		echo "SAM.gov enrichment skipped (set SAMGOV_NOTICE_ID to enable)."; \
	fi
deploy-api:
	docker-compose up --build -d
deploy-web:
	cd packages/demo-dashboard && npx vercel --prod --yes || echo "Vercel CLI not found or not configured."
deploy-mobile:
	cd packages/bickford-mobile-ui && npx vercel --prod --yes || echo "Vercel CLI not found or not configured."
	cd packages/bickford-mobile-ui && npx eas submit --platform all --profile production --non-interactive || echo "EAS CLI not found or not configured."


# --- Deploy All ---
deploy-all: deploy-api deploy-web deploy-mobile
# --- Mobile UI (PWA) ---
mobile-ui-install:
	cd packages/bickford-mobile-ui && npm install

mobile-ui-dev:
	cd packages/bickford-mobile-ui && npm run dev


# --- Unified Build & Deploy Automation ---

.PHONY: build-all deploy-all deploy-api deploy-web deploy-mobile
.PHONY: complete

mobile-ui-build:
	cd packages/bickford-mobile-ui && npm run build


# --- API Deploy (Docker Compose, can be replaced with cloud CLI) ---
mobile-ui-preview:
	cd packages/bickford-mobile-ui && npm run preview

.PHONY: bid-pack bid-verify
.PHONY: bid-archive

bid-pack:
	npm run bid:prep

bid-verify:
	cd bid_out && sha256sum -c MANIFEST.sha256

bid-archive: bid-pack bid-verify
	tar -czf bid_pack.tar.gz -C bid_out .
	sha256sum bid_pack.tar.gz > bid_pack.tar.gz.sha256
# --- Web Deploy (Vercel CLI, can be replaced with cloud CLI) ---
# Bickford Automation Makefile


# --- Mobile Deploy (Vercel for PWA, EAS for native) ---
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
