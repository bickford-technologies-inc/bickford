# CUSTOMER DISCOVERY AUTOMATION PACKAGE

## CONTENTS

### 📞 Interview Scripts

- `interview-scripts/INTERVIEW_SCRIPT.md` - Complete 30-45 min interview guide

### 📧 Email Templates

- `email-templates/initialOutreach.txt` - First contact email
- `email-templates/followUp1Week.txt` - One week follow-up
- `email-templates/postInterview.txt` - Thank you + summary
- `email-templates/pilotInvitation.txt` - Free pilot offer
- `email-templates/loiRequest.txt` - Letter of intent request
- `email-templates/loiTemplate.txt` - LOI template

### 📊 Tracking

- Customer discovery tracker (TypeScript class)
- Automated reporting
- Progress metrics

## USAGE

### 1. Initial Outreach (Week 1)

```
# Identify 20 target companies
# Send initialOutreach.txt to each
# Track responses
```

### 2. Interviews (Week 2-4)

```
# Use INTERVIEW_SCRIPT.md for each call
# Record pain points, urgency, fit scores
# Send postInterview.txt after each call
```

### 3. LOI Collection (Week 3-6)

```
# Send loiRequest.txt to high-fit customers
# Include loiTemplate.txt
# Track LOI status
```

### 4. Pilot Deployment (Week 5-12)

```
# Send pilotInvitation.txt to customers with LOIs
# Deploy Bickford for pilot customers
# Measure actual ROI
```

## GOALS

- [ ] 10+ customer interviews completed
- [ ] 3+ LOIs received
- [ ] 1+ pilot customer deployed
- [ ] Market validation confirmed

## TRACKING

Use the CustomerDiscoveryTracker to track:

- All customer contacts
- Interview notes and scores
- LOI requests and status
- Pilot deployment progress

## NEXT STEPS

1. Create target customer list (20 companies)
2. Send first batch of outreach emails (5-10)
3. Schedule interviews as responses come in
4. Use interview script to gather consistent data
5. Request LOIs from high-fit customers
6. Deploy pilots for customers with LOIs
