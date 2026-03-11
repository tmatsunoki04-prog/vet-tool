document.addEventListener('DOMContentLoaded', () => {

    // --- Supabase Analytics Setup MVP ---
    // Project URL and Anon Key are explicitly left as placeholders for the user to set.
    const SUPABASE_URL = 'https://dfgxdlnwhxwndbyzcahf.supabase.co'; // 変更済：Project URL
    const SUPABASE_ANON_KEY = 'sb_publishable_H9GAYPbeWvynBysEZSUARg__SYAePSl'; // 変更済：Publishable (Anon) Key
    let _supabase = null;
    let _sessionId = null;

    try {
        if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
            _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Manage anonymous session ID in localStorage (persists across tabs but no PII)
            _sessionId = localStorage.getItem('vet_session_id');
            if (!_sessionId) {
                _sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('vet_session_id', _sessionId);
                
                // Insert new session record ONLY ONCE per generated ID
                _supabase.from('sessions').insert([{ 
                    session_id: _sessionId, 
                    user_agent: navigator.userAgent, 
                    referrer: document.referrer 
                }]).then();
            }
        }
    } catch (error) {
        console.warn("Analytics tracking is disabled due to environment restrictions.");
    }

    // Helper to track events safely
    function trackEvent(eventName, eventData = {}) {
        try {
            if (!_supabase || !_sessionId) return;
            _supabase.from('events').insert([{ 
                session_id: _sessionId, 
                event_name: eventName, 
                event_data: eventData 
            }]).catch(e => { /* ignore insert errors */ });
        } catch (error) {
            // Fallback: prevent crash if _supabase object is somehow corrupted
        }
    }
    
    // 1. Event: page_view
    trackEvent('page_view', { path: window.location.pathname });

    // --- App State ---
    const APP_STATE = {
        petType: '未選択',
        petGenderAge: '未選択',
        symptomStart: '未選択',
        mainComplaint: [], // Multi-select array
        otherSymptomText: '', // For custom input
        energyAppetite: '未選択',
        details: '特になし'
    };

    // --- DOM Elements ---
    const cards = Array.from(document.querySelectorAll('.card'));
    const totalSteps = cards.length;
    let currentCardIndex = 0;

    const backBtn = document.getElementById('back-btn');
    const currentStepDisplay = document.getElementById('current-step-display');
    const totalStepsDisplay = document.getElementById('total-steps-display');
    totalStepsDisplay.textContent = totalSteps;

    const seedRow = document.getElementById('seed-row');
    const visualFeedbackLayer = document.getElementById('visual-feedback-layer');
    const seedTray = document.querySelector('.seed-tray');

    const resultSection = document.getElementById('result-section');
    const cardDeck = document.getElementById('card-deck');
    const emergencyModalBtn = document.getElementById('emergency-modal-btn');
    const headerEl = document.querySelector('.app-header');

    // --- Modal Logic ---
    const modal = document.getElementById('emergency-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');

    emergencyModalBtn.addEventListener('click', () => {
        modal.showModal();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.close();
    });

    // Close when clicking outside modal bounds
    modal.addEventListener('click', (e) => {
        const dialogDimensions = modal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            modal.close();
        }
    });


    // --- Navigation Logic ---
    function updateCardView(direction = 'forward') {
        cards.forEach((card, index) => {
            card.classList.remove('active-card', 'hidden-card', 'reverse');
            if (index === currentCardIndex) {
                card.classList.add('active-card');
            } else {
                card.classList.add('hidden-card');
                if ((direction === 'forward' && index < currentCardIndex) ||
                    (direction === 'backward' && index > currentCardIndex)) {
                    // Controls slide animation direction class if implemented in CSS
                    card.classList.add('reverse');
                }
            }
        });

        currentStepDisplay.textContent = currentCardIndex + 1;

        if (currentCardIndex === 0) {
            backBtn.classList.add('hidden');
        } else {
            backBtn.classList.remove('hidden');
        }

        // Dynamically inject Context Summary into Card 6 (index 5)
        if (currentCardIndex === 5) {
            const contextList = document.getElementById('context-list');
            contextList.innerHTML = `
                <li><span class="label">症状:</span> ${getFormattedSymptoms()}</li>
                <li><span class="label">発症:</span> ${APP_STATE.symptomStart}</li>
                <li><span class="label">元気・食欲:</span> ${APP_STATE.energyAppetite}</li>
                <li><span class="label">種別:</span> ${APP_STATE.petType}</li>
                <li><span class="label">性別:</span> ${APP_STATE.petGenderAge}</li>
            `;
        }

        // Hide UI elements on the final generation/result screen if desired
        if (currentCardIndex === totalSteps - 1) {
            // Final confirmation card
            const count = Array.from(seedRow.children).length;
            document.getElementById('seed-count').textContent = count;

            // Inject SVGs instead of text circles
            const iconsDisplay = document.getElementById('seed-icons-display');
            iconsDisplay.innerHTML = '';
            for (let i = 0; i < count; i++) {
                iconsDisplay.innerHTML += `<svg class="seed-icon" style="width:16px; height:16px; margin-right:4px; margin-bottom:-2px;"><use href="#icon-leaf"></use></svg>`;
            }
        }
    }

    backBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            updateCardView('backward');
            // Remove last seed if navigating backwards (UX touch)
            if (seedRow.lastChild) {
                seedRow.removeChild(seedRow.lastChild);
            }
        }
    });

    // --- Choice Selection (Tap to advance or multi-select) ---
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.card');
            const dataField = card.getAttribute('data-field');
            const value = btn.getAttribute('data-value');

            // Handle Multi-select (Card 1)
            if (btn.classList.contains('multi-select')) {
                btn.classList.toggle('is-selected');

                // Toggle value in state array
                if (APP_STATE.mainComplaint.includes(value)) {
                    APP_STATE.mainComplaint = APP_STATE.mainComplaint.filter(v => v !== value);
                    // Hide custom input if 'その他' is deselected
                    if (value === 'その他') {
                        document.getElementById('other-symptom-container').classList.add('hidden');
                    }
                    // Remove one seed visually to match state
                    if (seedRow.lastChild) {
                        seedRow.removeChild(seedRow.lastChild);
                    }
                } else {
                    APP_STATE.mainComplaint.push(value);
                    // Show custom input if 'その他' is selected
                    if (value === 'その他') {
                        document.getElementById('other-symptom-container').classList.remove('hidden');
                    }
                    animateSeedFlight(e.clientX, e.clientY); // Plink a seed only when selecting
                }
                return; // Do NOT auto-advance
            }

            // Save state for single-select
            if (dataField && !btn.classList.contains('multi-select')) {
                APP_STATE[dataField] = value;
                // 3. Event: select_species
                if (dataField === 'petType') {
                    trackEvent('select_species', { species: value });
                }
            }

            // Animate Seed Feedback
            animateSeedFlight(e.clientX, e.clientY);

            // Advance
            setTimeout(() => {
                if (currentCardIndex < totalSteps - 1) {
                    currentCardIndex++;
                    updateCardView('forward');
                }
            }, 300); // Small delay to show button tap effect
        });
    });

    // Step 1: Multi-select Advancement
    document.getElementById('btn-card1-next').addEventListener('click', (e) => {
        // 2 & 4. Event: start_diagnosis AND select_symptom_category
        trackEvent('start_diagnosis');
        trackEvent('select_symptom_category', { symptoms: APP_STATE.mainComplaint.filter(s => s !== 'その他') });
        if (APP_STATE.mainComplaint.length === 0) {
            APP_STATE.mainComplaint = ['特になし（または未選択）'];
        }

        // Save custom text if 'その他' is selected
        if (APP_STATE.mainComplaint.includes('その他')) {
            const customText = document.getElementById('other-symptom-input').value.trim();
            APP_STATE.otherSymptomText = customText ? customText : '入力なし';
        }

        // Ensure a seed flew if they just clicked next without clicking a specific one, or if they unclicked
        // Not strictly necessary but keeps the flow feeling consistent

        if (currentCardIndex < totalSteps - 1) {
            currentCardIndex++;
            updateCardView('forward');
        }
    });

    // Helper to format symptoms text
    function getFormattedSymptoms() {
        if (APP_STATE.mainComplaint.length === 0) return '未選択';

        return APP_STATE.mainComplaint.map(s => {
            if (s === 'その他' && APP_STATE.otherSymptomText) {
                return `その他（${APP_STATE.otherSymptomText}）`;
            }
            return s;
        }).join('、');
    }

    // Step 6: Text Input Advancement
    document.getElementById('btn-to-confirm').addEventListener('click', () => {
        const detailsVal = document.getElementById('free-text-details').value.trim();
        APP_STATE.details = detailsVal ? detailsVal : '特になし';

        animateSeedFlight(window.innerWidth / 2, window.innerHeight / 2); // Center animation

        if (currentCardIndex < totalSteps - 1) {
            currentCardIndex++;
            updateCardView('forward');
        }
    });


    // --- Visual Feedback Animation ---
    function animateSeedFlight(startX, startY) {
        // Create flying dot (now containing an SVG)
        const flyingSeed = document.createElement('div');
        flyingSeed.classList.add('flying-seed');
        flyingSeed.style.left = `${startX}px`;
        flyingSeed.style.top = `${startY}px`;
        flyingSeed.innerHTML = `<svg class="seed-icon"><use href="#icon-leaf"></use></svg>`;
        visualFeedbackLayer.appendChild(flyingSeed);

        // Calculate Target (Center bottom roughly)
        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight - 30; // Approximating seed tray position

        // Force reflow
        void flyingSeed.offsetWidth;

        // Fly
        flyingSeed.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`;
        flyingSeed.style.opacity = '0';

        setTimeout(() => {
            flyingSeed.remove();
            // Plant physical dot
            const planted = document.createElement('div');
            planted.classList.add('planted-seed');
            planted.innerHTML = `<svg class="seed-icon"><use href="#icon-leaf"></use></svg>`;
            seedRow.appendChild(planted);
        }, 600);
    }


    // --- Report Generation (LLM Free, Pure JS template) ---
    const generateBtn = document.getElementById('generate-btn');
    const outputReport = document.getElementById('output-report');

    generateBtn.addEventListener('click', () => {
        // 5. Event: result_generated
        trackEvent('result_generated', { completed_steps: totalSteps });
        
        // Save structured result silently without details/free text
        if (_supabase && _sessionId) {
            _supabase.from('results').insert([{
                session_id: _sessionId,
                pet_type: APP_STATE.petType !== '未選択' ? APP_STATE.petType : null,
                symptoms: APP_STATE.mainComplaint.filter(s => s !== 'その他'), // exclude custom input
                symptom_start: APP_STATE.symptomStart !== '未選択' ? APP_STATE.symptomStart : null,
                energy_appetite: APP_STATE.energyAppetite !== '未選択' ? APP_STATE.energyAppetite : null
            }]).catch(console.error);
        }

        const reportText = `【獣医師受診用レポート】

■ 1. ペットの基本情報
・種別: ${APP_STATE.petType}
・性別および去勢避妊状況（または年齢等）: ${APP_STATE.petGenderAge}

■ 2. 症状について
・主訴（気になること）: ${getFormattedSymptoms()}
・いつから症状があるか: ${APP_STATE.symptomStart}
・元気と食欲: ${APP_STATE.energyAppetite}

■ 3. その他・詳細な違和感
${APP_STATE.details}

----------------------------------------
※本レポートは情報整理であり、診断や緊急度の判定は行っていません。`;

        // Display
        outputReport.value = reportText;

        // Hide Main App UI, reveal result
        cardDeck.classList.add('hidden');
        headerEl.classList.add('hidden');
        seedTray.classList.add('hidden');
        emergencyModalBtn.classList.add('hidden');
        resultSection.classList.remove('hidden');

        window.scrollTo(0, 0);
    });

    // --- Final Actions ---
    document.getElementById('copy-btn').addEventListener('click', async () => {
        // 6. Event: copy_result
        trackEvent('copy_result');
        try {
            await navigator.clipboard.writeText(outputReport.value);
            showToast('クリップボードにコピーしました');
        } catch (err) {
            outputReport.select();
            document.execCommand('copy');
            showToast('クリップボードにコピーしました');
        }
    });

    // --- Toast UI ---
    let toastTimeout;
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000); // Hide after 2 seconds
    }

    // --- X Share (Dynamic URL) ---
    function buildXIntentUrl() {
        const url = window.location.href; // ★クエリ含めてそのまま共有
        const text = "ペットの症状整理ツールで受診用メモを作りました。";
        const hashtags = "犬,猫,動物病院";

        return "https://twitter.com/intent/tweet?text=" +
            encodeURIComponent(text) +
            "&url=" + encodeURIComponent(url) +
            "&hashtags=" + encodeURIComponent(hashtags);
    }

    const xBtn = document.querySelector("#btnShareX");
    if (xBtn) {
        xBtn.addEventListener("click", () => {
            try {
                window.open(buildXIntentUrl(), "_blank", "noopener,noreferrer");
                if (typeof showToast === "function") showToast("Xの投稿画面を開きました");
            } catch (e) {
                console.error(e);
            }
        });
    }

    document.getElementById('restart-btn').addEventListener('click', () => {
        // Reset State
        Object.keys(APP_STATE).forEach(k => {
            if (Array.isArray(APP_STATE[k])) {
                APP_STATE[k] = [];
            } else {
                APP_STATE[k] = '未選択';
            }
        });
        APP_STATE.details = '特になし';
        APP_STATE.otherSymptomText = '';
        document.getElementById('free-text-details').value = '';
        document.getElementById('other-symptom-input').value = '';
        document.getElementById('other-symptom-container').classList.add('hidden');

        // Reset UI selections
        document.querySelectorAll('.is-selected').forEach(el => el.classList.remove('is-selected'));

        // Reset UI
        seedRow.innerHTML = '';
        currentCardIndex = 0;
        updateCardView('backward');

        // Reveal App UI
        cardDeck.classList.remove('hidden');
        headerEl.classList.remove('hidden');
        seedTray.classList.remove('hidden');
        emergencyModalBtn.classList.remove('hidden');
        resultSection.classList.add('hidden');
    });

    // --- URL Preset Initialization ---
    // (Supabase analytics tracking events successfully integrated)
    function applyMainComplaintPresetFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get("mc");

        if (!raw) return;

        const tokens = raw
            .split(/[,\u3001]/)
            .map(v => v.trim())
            .filter(Boolean);

        const buttons = Array.from(
            document.querySelectorAll("#card-1 .choice-btn.multi-select")
        );

        const valueMap = new Map(
            buttons.map(btn => [btn.getAttribute("data-value"), btn])
        );

        const normalize = (t) => {
            if (/下痢|軟便/.test(t)) return "下痢をしている";
            if (/嘔吐|吐/.test(t)) return "吐いている";
            if (/元気|食欲/.test(t)) return "元気・食欲がない";
            if (/咳|呼吸/.test(t)) return "咳・苦しそう";
            if (/痛|歩/.test(t)) return "痛がる・歩き方が変";
            if (/皮膚|耳|痒/.test(t)) return "皮膚・耳の異常";
            if (/尿|おしっこ/.test(t)) return "排尿の異常";
            return null;
        };

        tokens.forEach(token => {
            const value = normalize(token);
            if (!value) return;

            const btn = valueMap.get(value);
            if (!btn) return;

            btn.classList.add("is-selected");

            if (!APP_STATE.mainComplaint.includes(value)) {
                APP_STATE.mainComplaint.push(value);
            }
        });
    }

    applyMainComplaintPresetFromUrl();

});
