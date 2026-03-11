# Project Configuration

This document outlines the core concept, workflow, and rules for this project. All AI agents must adhere to these directives.

## Concept
* **Ownership**: あなたはコードを書かず、意思決定とディレクションに特化する。(You specialize in decision-making and direction, not writing code directly unless dictated by your role.)
* **Hybrid Structure**: 上流（デザイン）は人間のプロ、下流（実装）はAIチームという分担。(Upstream (design) by human professionals, downstream (implementation) by the AI team.)
* **MVP First**: 最小の機能で動作するプロトタイプ（MVP）の完成を最優先する。(Completing the Minimum Viable Product (MVP) that works with the minimum features is the top priority.)
* **Security Principle**: MVPを止めない範囲で、危険操作・機密漏洩・外部送信を確実に防ぐ。(Reliably prevent dangerous operations, information leaks, and external transmissions as long as it doesn't stop the MVP.)

## Workflow Sequence
1. User
2. Product Owner (PO)
3. PM / Document
4. Architect
5. Frontend (FE)
6. Backend (BE)
7. Reviewer
8. Security Policy
9. QA

## Common Rules
1. 最優先は「動作する最小プロトタイプ（MVP）」の完成です。(Top priority is completing the MVP.)
2. 不明点は勝手に決定せず、Assumption（仮定）として明示しPMに確認します。(Do not decide unknowns arbitrarily; specify them as Assumptions and confirm with the PM.)
3. 既存コードを破壊する変更は禁止。変更は最小差分で提案します。(Changes that break existing code are prohibited. Propose changes with minimal diffs.)
4. 出力には必ず以下を含めます：実施内容（What changed）、確認方法（How to verify）、残タスク（TODO）(Output must include: What changed, How to verify, TODOs.)
5. シンプルで拡張可能な構造を優先します。過剰設計は禁止です。(Prioritize simple and scalable structures. Over-engineering is prohibited.)
