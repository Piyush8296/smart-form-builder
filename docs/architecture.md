# Architecture Diagrams

---

## High-Level Design

System-level view — user journeys, major subsystems, and persistence.

![HLD](hld.svg)

```mermaid
flowchart TB
    User(["User (Browser)"])
    Respondent(["Respondent (Browser)"])

    subgraph Auth ["Auth Layer (Builder only)"]
        Session["Email Session\n(no password)"]
    end

    subgraph Protected ["Protected Routes"]
        Home["Home Page\nTemplate list & management"]

        subgraph Builder ["Builder Mode"]
            BUI["Field Canvas\nDrag · Add · Reorder"]
            Config["Config Panel\nField settings & conditions"]
            Preview["Preview Tab\n(new window)"]
        end

        Instances["Instances Page\nResponse history & CSV export"]
    end

    subgraph Public ["Public Routes (no auth)"]
        subgraph Fill ["Fill Mode"]
            Form["Form Renderer\nReal-time condition eval"]
            Submit["Submit & Post-submit\nConfirmation screen"]
            PDF["PDF Export\nwindow.print()"]
        end
    end

    subgraph Persist ["Persistence (localStorage)"]
        direction LR
        Templates[("Templates\nfb:template:{id}")]
        Instances2[("Submissions\nfb:instance:{id}")]
        Drafts[("Drafts\nfb:draft:{templateId}")]
    end

    User --> Session
    Session --> Home
    Home --> Builder
    Home --> Instances
    Builder --> Templates
    Builder --> Preview

    Respondent --> Form
    User --> Form
    Form --> Submit
    Submit --> Instances2
    Form --> PDF
    Fill --> Drafts
```

---

## Low-Level Design

Module-level data flow — how a user action propagates through the layers.

![LLD](lld.svg)

```mermaid
flowchart TD
    subgraph Routes ["pages/"]
        HP["HomePage"]
        BP["BuilderPage"]
        FP["FillPage"]
    end

    subgraph Contexts ["contexts/"]
        SC["SessionContext\nauth state + current user"]
        BC["BuilderContext\nform template state"]
        FC["FillContext\nanswers + visibility map"]
    end

    subgraph Hooks ["hooks/"]
        UH["useHome\ntemplate list + CRUD"]
        UB["useBuilder\nfield ops + conditions"]
        UF["useFill\nSET_ANSWER pipeline"]
    end

    subgraph State ["state/  (pure reducers)"]
        BR["builderReducer\nADD_FIELD · MOVE · DELETE\nUPDATE_CONFIG · ADD_CONDITION"]
        FR["fillReducer\nSET_ANSWER → eval → calc"]
    end

    subgraph Logic ["logic/  (pure functions)"]
        CE["conditionEvaluator\ntopological sort + eval"]
        CA["calculationEngine\ncomputed field values"]
        VA["validationEngine\nvisible fields only"]
    end

    subgraph Storage ["storage/  (localStorage adapters)"]
        TS["templateStore"]
        IS["instanceStore"]
        AU["authStore · accessStore"]
    end

    subgraph Registry ["registry/  (field plugin system)"]
        FP2["FieldPlugin × 17\ncreateDefault · ConfigEditor\nFieldRenderer · validate\nformatForPrint"]
    end

    subgraph Contracts ["types/ · enums/ · constants/"]
        T["FieldConfig union\nFieldValue · Template\nInstance · Session"]
    end

    HP --> SC & UH & Storage
    BP --> BC --> UB --> BR
    FP --> FC --> UF --> FR

    UF --> CE --> CA
    CA --> VA

    UB & UF --> Storage
    BR & FR --> Registry
    Registry --> Contracts
    State --> Contracts
    Logic --> Contracts
    Storage --> Contracts
```

---

## Sequence Diagrams

### Builder Mode — field edit pipeline

User actions in the builder propagate through `builderReducer`, trigger a React re-render of the affected panel, then auto-save (debounced 500 ms) to `localStorage`.

![Builder sequence](sequence-builder.svg)

```mermaid
sequenceDiagram
    participant U as User (Builder)
    participant BR as builderReducer
    participant TS as templateStore
    participant React as React (memo)

    U->>BR: ADD_FIELD / MOVE / DELETE
    BR-->>React: new fields[]
    React-->>U: re-render FieldList

    U->>BR: UPDATE_CONFIG {fieldId, patch}
    BR-->>React: updated field config
    React-->>U: re-render ConfigPanel

    U->>BR: ADD_CONDITION / REMOVE_CONDITION
    BR-->>React: updated conditions[]
    React-->>U: re-render ConditionEditor

    BR->>TS: autoSave (debounced 500ms)
    TS-->>BR: persisted to localStorage
```

### Fill Mode — SET_ANSWER pipeline

Every keystroke / field change runs the full condition + calculation pipeline before React re-renders only the affected fields.

![Fill sequence](sequence-fill.svg)

```mermaid
sequenceDiagram
    participant U as User (Respondent)
    participant FR as fillReducer
    participant CE as conditionEvaluator
    participant CA as calculationEngine
    participant React as React (memo)

    U->>FR: SET_ANSWER {fieldId, value}
    FR->>CE: evaluateAllFields(fields, answers)
    CE-->>FR: visibilityMap
    FR->>CA: applyCalculations(fields, answers, visibilityMap)
    CA-->>FR: updated answers (computed fields)
    FR-->>React: new state
    React-->>U: re-render affected fields only
```
