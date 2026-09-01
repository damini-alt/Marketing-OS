# Pucho Workflow Guide — Step-by-Step

Yeh document ek REAL Pucho workflow ko line-by-line samjhata hai.
Workflow: **Invoice OCR → JSON output** (Chat me image bhejo → text nikaalo → JSON banao → UI pe dikhao)

Har "Age" (stage) ko samjho: outer se inner tak ek chain ki tarah.

---

## 🧠 Workflow ka Visual Flow

```
     +----------+
     | TRIGGER  |  Chat UI me user ne image bheji
     | (chat)   |
     +----+-----+
          |
          v
     +----------+
     |  STEP 1  |  OCR: Image se text extract karo (AI vision)
     |  (OCR)   |
     +----+-----+
          |
          v
     +----------+
     |  STEP 3  |  Text ko structured JSON me convert karo
     |  (JSON)  |
     +----+-----+
          |
          v
     +----------+
     |  STEP 2  |  Final JSON Chat UI pe response ke roop me dikhao
     | (Reply)  |
     +----------+
```

---

## AGE 1: ENVELOPE (Outer Wrapper)
```
Line 1-13
```

Yeh poore workflow ka "packaging" hai. Metadata + pieces ki list.

```json
"created": "1783422455566",      // Kab banaya (timestamp)
"updated": "1783422455566",      // Last update kab hua
"name": "Invoice OCR with JSON output",  // Workflow ka naam
"description": "",               // Optional description
"tags": [],                      // Tags (empty = no category)
"pieces": [                      // Kaun-kaun se TOOLS use ho rahe hain
  "@puchoaistudio/tool-forms",         // Chat UI ke liye
  "@puchoaistudio/tool-ocr-analytics", // Image se text nikaalne ke liye
  "@puchoaistudio/tool-json"          // Text → JSON convert ke liye
],
```

> ⚠️ **Rule**: `pieces[]` me SIRF wahi tools aane chahiye jo actual me steps me use hue hain. Agar ek bhi tool add nahi kiya to import fail hoga — aur agar extra tool daala to bhi warning aayegi.

---

## AGE 2: TEMPLATE — Workflow ka Core
```
Line 12-150
```

`template` ke andar:
- **trigger**: workflow ka starting point
- **valid**: `true` (active hai)
- **agentIds**: AI agents ki list (empty = no agents)
- **connectionIds**: connected accounts ki IDs (empty = user baad me connect karega)
- **schemaVersion**: `"7"` (latest version)

```json
"template": {
  "displayName": "Invoice OCR with JSON output",
  "trigger": { ... },           // ← AGE 3 me detail
  "valid": true,
  "agentIds": [],
  "connectionIds": [],
  "schemaVersion": "7"
}
```

> 🎯 **Key Insight**: `connectionIds` empty hone ka matlab user yeh workflow import karne ke baad apne Gmail/Sheets account connect karega. Yeh "portable mode" hai.

---

## AGE 3: TRIGGER — Shuruaat ka Point
```
Line 14-38
```

User jab Pucho Chat UI me kuch bhejta hai, yeh trigger fire hota hai.

```json
"trigger": {
  "name": "trigger",            // ⚠️ HAMESHA "trigger" hona chahiye
  "type": "TOOL_TRIGGER",       // Trigger ka type (NOT "PIECE_TRIGGER")
  "displayName": "Chat UI",     // UI me dikhne wala naam
  "valid": true,                // Active hai
  "settings": {
    "pieceName": "@puchoaistudio/tool-forms",  // Kaunsa tool use ho raha
    "pieceVersion": "2.0.1",                  // Tool ka version
    "triggerName": "chat_submission",         // Specific trigger ka naam
    "input": {
      "botName": "OCR Test"                   // Chat bot ka naam
    },
    "propertySettings": {       // Har input field ki type batata hai
      "about": { "type": "MANUAL" },
      "botName": { "type": "MANUAL" },
      "responseMarkdown": { "type": "MANUAL" }
    },
    "sampleData": {}            // Sample data (empty = production)
  },
```

| Field | Meaning | Example |
|---|---|---|
| `pieceName` | Kaunsa tool | `tool-forms` = Chat UI |
| `triggerName` | Kaunsa trigger event | `chat_submission` = jab user chat bheje |
| `input` | Trigger ke parameters | `botName: "OCR Test"` |
| `propertySettings` | Har input ka type | `MANUAL` = user ne khud set kiya |

> 🔴 **Note**: Trigger node pe `errorHandlingOptions` aur `skip` NAHI hote. Agar daal diye to import fail ho sakta hai.

---

## AGE 4: nextAction CHAIN — Steps ki Linking
```
Line 39-144
```

Yeh sabse important concept hai. Har node ke andar `nextAction` hota hai jo agle step ko point karta hai. Yeh ek **nested chain** hai:

```
TRIGGER
  └─ nextAction → STEP 1 (OCR)
                    └─ nextAction → STEP 3 (JSON)
                                      └─ nextAction → STEP 2 (Reply)
                                                        └─ nextAction → null (flow ends)
```

> 🧵 **Key Insight**: JSON me yeh nested hai (andar-andar). Har step ke andar uska agla step defined hai. Last step ka `nextAction` `undefined` hota hai (ya nahi hota) — wahan flow rukta hai.

---

## AGE 5: STEP 1 — OCR Analytics (Image → Text)
```
Line 40-143
```

User ne jo image bheji, uska text extract karo using AI Vision.

```json
{
  "name": "step_1",
  "skip": false,                // Agar true hota to yeh step skip
  "type": "PIECE",              // Action node (NOT trigger)
  "displayName": "OCR Analytics - Ask Image/PDF",
  "valid": true,
  "settings": {
    "pieceName": "@puchoaistudio/tool-ocr-analytics",
    "actionName": "askImage/PDF",           // Action ka naam (LITERAL SLASH)
    "pieceVersion": "2.1.1",
    "input": {
      "url": "{{trigger['files'][0]}}",     // ← User ki uploaded file
      "model": "openrouter/anthropic/claude-sonnet-4.5",
      "query": "Extract the Invoice",       // AI ko kya karna hai
      "puchoModelKey": "openrouter/anthropic/claude-sonnet-4.5",
      "puchoProviderName": "OpenRouter"
    },
    "propertySettings": { ... },
    "errorHandlingOptions": {
      "retryOnFailure": { "value": false },   // Fail pe retry NAHI karna
      "continueOnFailure": { "value": false } // Fail pe aage NAHI badhna
    }
  },
```

### Input fields ka breakdown:

| Input | Value | Meaning |
|---|---|---|
| `url` | `{{trigger['files'][0]}}` | User ne jo file upload ki (pehli file) |
| `query` | `"Extract the Invoice"` | AI ko instruction |
| `model` | AI model | Claude Sonnet 4.5 via OpenRouter |
| `puchoModelKey` | Same model key | Pucho ka internal identifier |
| `puchoProviderName` | `"OpenRouter"` | Provider ka naam |

> 🎯 **Data Reference**: `{{trigger['files'][0]}}` bracket notation me trigger se data le raha hai. Dot notation (`trigger.files[0]`) kaam nahi karega!

---

## AGE 6: STEP 3 — Convert Text → JSON
```
Line 83-141
```

Step 1 ka raw text output abhi string hai — isse structured JSON me convert karo.

```json
{
  "name": "step_3",
  "displayName": "Convert Text to Json",
  "settings": {
    "pieceName": "@puchoaistudio/tool-json",
    "actionName": "convert_text_to_json",
    "input": {
      "text": "{{step_1['data']}}"     // ← Step 1 ka output as input
    },
    ...
  }
```

| Input | Value | Meaning |
|---|---|---|
| `text` | `{{step_1['data']}}` | OCR se jo text aaya, wo data |

---

## AGE 7: STEP 2 — Respond on UI
```
Line 109-140
```

Final step: JSON output Chat UI pe user ko dikhao.

```json
{
  "name": "step_2",
  "displayName": "Respond on UI",
  "settings": {
    "pieceName": "@puchoaistudio/tool-forms",
    "actionName": "return_response",
    "input": {
      "markdown": "{{step_3['response']}}"   // Step 3 ka JSON response
    },
    ...
  }
}
```

> 🎯 **Note**: Yeh `tool-forms` ka `return_response` hai — Chat UI pe reply bhejta hai. Agar flow **webhook trigger** se shuru hota, to `tool-webhook` ka `return_response` use hota.

---

## AGE 8: Flow Ka Ant
```
Line 139: "displayName": "Respond on UI"
Line 140-141: }
```

Step 2 ke baad koi `nextAction` nahi — flow yahan khatam.

```
nextAction: undefined  →  🏁 FLOW ENDS
```

---

## 📊 Complete Data Flow at a Glance

```
User image upload (trigger)
  |
  v
trigger['files'][0]    ← Image file URL
  |
  v
STEP 1: askImage/PDF   ← OCR se text nikaala
  |  input: url = {{trigger['files'][0]}}
  |  output: text string
  |
  v
step_1['data']         ← Raw extracted text
  |
  v
STEP 3: convert_text_to_json  ← Text ko JSON me convert
  |  input: text = {{step_1['data']}}
  |  output: JSON object
  |
  v
step_3['response']     ← Structured JSON
  |
  v
STEP 2: return_response  ← Chat UI pe dikhao
  |  input: markdown = {{step_3['response']}}
  |
  v
🏁 DONE — User ko JSON output dikh gaya
```

---

## 🔑 Top 10 Golden Rules

1. **Trigger name hamesha `"trigger"`** — kuch aur nahi chalega.
2. **Trigger type = `"TOOL_TRIGGER"`** — `PIECE_TRIGGER` outdated hai.
3. **Data reference = bracket notation**: `{{trigger['body']['field']}}` ✅ | `{{trigger.body.field}}` ❌
4. **Har input key ka `propertySettings` me entry honi chahiye**.
5. **Step chaining = `nextAction` nesting** — JSON andar-andar linked hai.
6. **Pieces[] = exact tools used** — na kam, na zyada.
7. **Router branches = hamesha aakhri branch `FALLBACK` ("Otherwise")**.
8. **`sampleData: {}`** — always empty (production me real data use hota hai).
9. **Error handling:** Critical steps (Sheets insert) → `retry:true`. Notifications (email) → `continue:true`.
10. **LLM output hamesha string** hota hai — structured data ke liye CODE node se `JSON.parse()` karo.

---

## 🛠️ Common Node Types Summary

| Type | Use Case | Key Setting |
|---|---|---|
| `TOOL_TRIGGER` | Flow ka start | `triggerName` |
| `PIECE` | Action perform karna | `actionName` |
| `ROUTER` | Conditions pe branch | `branches[]` + `children[]` |
| `CODE` | Custom JavaScript | `sourceCode.code` |
| `LOOP` | Repeat per item | `items` + `firstLoopAction` |

---

## 📝 Adding a New Step (Step 4 Example)

Maan lo tumhe email bhi bhejna hai. Tum kya karoge:

```json
// Step 2 ke nextAction ke andar:
"nextAction": {
  "name": "step_4",
  "type": "PIECE",
  "displayName": "Send Email",
  "valid": true,
  "skip": false,
  "settings": {
    "pieceName": "@puchoaistudio/tool-gmail",
    "actionName": "sendEmail",
    "pieceVersion": "^2.0.0",
    "input": {
      "auth": "",
      "to": "client@example.com",
      "subject": "Your Invoice",
      "body": "{{step_3['response']}}"  // Step 3 ka JSON as email body
    },
    "propertySettings": {
      "auth": { "type": "MANUAL" },
      "to": { "type": "MANUAL" },
      "subject": { "type": "MANUAL" },
      "body": { "type": "MANUAL" }
    },
    "errorHandlingOptions": {
      "retryOnFailure": { "value": false },
      "continueOnFailure": { "value": true }   // Email fail = ignore, not critical
    }
  }
}
```

Aur `pieces[]` array me `"@puchoaistudio/tool-gmail"` add karna!

---

## ✅ Quick Checklist Before Import

- [ ] `pieces[]` me saare tools hain?
- [ ] Trigger ka `name: "trigger"` hai?
- [ ] Har step ka `propertySettings` complete hai?
- [ ] Data references bracket notation me hain?
- [ ] `sampleData: {}` har node me?
- [ ] `errorHandlingOptions` sahi criticality ke hisaab se?

---

Bas! Ab tumhe workflow JSON ka har age samajh aa gaya hoga. Next step: apna workflow design karna ya import karke test karna. 🚀
