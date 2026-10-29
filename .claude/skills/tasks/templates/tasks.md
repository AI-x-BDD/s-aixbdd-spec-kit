---

description: "Task list for {{FEATURE_TITLE}} implementation"
---

# Tasks: {{FEATURE_TITLE}} ({{FEATURE_TITLE_EN}})

**Input**: Design documents from `/specs/{{FEATURE_DIR}}/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: {{TESTS_POLICY}}

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/{{FEATURE_DIR}}/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
{{REFERENCE_LOCATOR_ITEMS}}
5. 部位內有 `$ref` 或引用其他部位時，順著讀到被引用的部位。
6. Must Read 與任務描述矛盾時，停下來回報，不自行決定。
7. 讀完 Must Read 與 Optional 仍缺資訊時，回報缺少什麼，不為了補資訊讀完整份文件。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

{{PATH_CONVENTION_ITEMS}}

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

{{SETUP_TASKS}}

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（{{FOUNDATIONAL_DATABASE_INTERFACES}}）

{{FOUNDATIONAL_DATABASE_TASKS}}

### 後端（{{FOUNDATIONAL_BACKEND_INTERFACES}}）

{{FOUNDATIONAL_BACKEND_TASKS}}

### 前端（{{FOUNDATIONAL_FRONTEND_INTERFACES}}）

{{FOUNDATIONAL_FRONTEND_TASKS}}

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - {{US1_TITLE}} (Priority: {{US1_PRIORITY}}) 🎯 MVP

**Goal**: {{US1_GOAL}}

**Independent Test**: {{US1_INDEPENDENT_TEST}}

### 資料庫（{{US1_DATABASE_INTERFACES}}）

{{US1_DATABASE_TASKS}}

### 後端（{{US1_BACKEND_INTERFACES}}）

{{US1_BACKEND_TASKS}}

### 前端（{{US1_FRONTEND_INTERFACES}}）

{{US1_FRONTEND_TASKS}}

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - {{US2_TITLE}} (Priority: {{US2_PRIORITY}})

**Goal**: {{US2_GOAL}}

**Independent Test**: {{US2_INDEPENDENT_TEST}}

### 資料庫（{{US2_DATABASE_INTERFACES}}）

{{US2_DATABASE_TASKS}}

### 後端（{{US2_BACKEND_INTERFACES}}）

{{US2_BACKEND_TASKS}}

### 前端（{{US2_FRONTEND_INTERFACES}}）

{{US2_FRONTEND_TASKS}}

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - {{US3_TITLE}} (Priority: {{US3_PRIORITY}})

**Goal**: {{US3_GOAL}}

**Independent Test**: {{US3_INDEPENDENT_TEST}}

### 後端（{{US3_BACKEND_INTERFACES}}）

> {{US3_NO_DATABASE_NOTE}}

{{US3_BACKEND_TASKS}}

### 前端（{{US3_FRONTEND_INTERFACES}}）

{{US3_FRONTEND_TASKS}}

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

{{POLISH_TASKS}}

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
{{STORY_ORDER_NOTES}}
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 ({{US1_PRIORITY}})**: {{US1_DEPENDENCIES}}
- **User Story 2 ({{US2_PRIORITY}})**: {{US2_DEPENDENCIES}}
- **User Story 3 ({{US3_PRIORITY}})**: {{US3_DEPENDENCIES}}

### Within Each User Story

{{WITHIN_STORY_ORDER_ITEMS}}
- Story complete before moving to next priority

### Parallel Opportunities

{{PARALLEL_OPPORTUNITY_ITEMS}}

---

## Parallel Example: User Story 1

```bash
{{US1_PARALLEL_EXAMPLE}}
```

## Parallel Example: User Story 2

```bash
{{US2_PARALLEL_EXAMPLE}}
```

## Parallel Example: User Story 3

```bash
{{US3_PARALLEL_EXAMPLE}}
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: {{MVP_VALIDATION}}
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：{{US1_DELIVERED_VALUE}})
3. Add User Story 2 → Test independently → Deploy/Demo（{{US2_DELIVERED_VALUE}}）
4. Add User Story 3 → Test independently → Deploy/Demo（{{US3_DELIVERED_VALUE}}）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
{{TEAM_STRATEGY_STEPS}}

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
{{PLAN_DEVIATION_NOTES}}
{{PENDING_CONFIRMATION_NOTES}}
