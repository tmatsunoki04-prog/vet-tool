import os
import datetime

TEMPLATE = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="stylesheet" href="style.css">
    <style>
        .landing-card {{ margin-bottom: 40px; }}
        .landing-section {{ margin-bottom: 25px; }}
        .cta-section {{ background-color: rgba(91, 143, 185, 0.1); border: 2px solid var(--primary-color); padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; }}
        .cta-title {{ color: var(--primary-color); font-size: 1.2rem; font-weight: bold; margin-bottom: 10px; }}
        .cta-desc {{ margin-bottom: 15px; color: var(--text-main); font-size: 0.95rem; }}
        .faq-item {{ background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--border-color); }}
        .faq-q {{ font-weight: bold; color: var(--primary-color); margin-bottom: 8px; display: flex; gap: 8px; }}
        .faq-a {{ color: var(--text-main); display: flex; gap: 8px; line-height: 1.5; }}
        .h2-title {{ font-size: 1.3rem; color: var(--text-main); margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid var(--border-color); padding-bottom: 8px; }}
        .landing-header {{ text-align: center; padding: 20px; font-weight: bold; color: var(--text-muted); }}
        .related-links {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }}
        .related-link {{ padding: 8px 16px; background: #fff; border: 1px solid var(--border-color); border-radius: 20px; color: var(--primary-color); text-decoration: none; font-size: 0.9rem; }}
        .related-link:hover {{ background: #f0f4f8; }}
    </style>
    <script type="application/ld+json">
    {{
     "@context": "https://schema.org",
     "@type": "FAQPage",
     "mainEntity": [
      {{
       "@type": "Question",
       "name": "この症状はすぐ病院に行くべき？",
       "acceptedAnswer": {{
        "@type": "Answer",
        "text": "症状の強さや持続時間によって異なります。気になる場合は早めに動物病院に相談してください。"
       }}
      }},
      {{
       "@type": "Question",
       "name": "このツールは診断をしますか？",
       "acceptedAnswer": {{
        "@type": "Answer",
        "text": "診断ではなく症状整理を目的としたツールです。"
       }}
      }}
     ]
    }}
    </script>
</head>
<body>
    <div class="app-container">
        <div class="landing-header">
            ペット受診サポート
        </div>
        
        <div class="card-deck" style="padding-top: 0;">
            <div class="card active-card landing-card">
                <h1 class="question" style="font-size: 1.5rem; text-align: left; line-height: 1.4;">{h1}</h1>
                
                <p class="instruction" style="text-align: left;">{intro}</p>

                <div class="landing-section">
                    <h2 class="context-title" style="font-size: 1.1rem;">1. {symptom_name}の概要</h2>
                    <p class="instruction" style="color: var(--text-main); margin-bottom: 0;">{overview}</p>
                </div>

                <div class="landing-section">
                    <h2 class="context-title" style="font-size: 1.1rem;">2. よくある原因</h2>
                    <p class="instruction" style="color: var(--text-main); margin-bottom: 0;">{causes}</p>
                </div>

                <!-- CTA 1 (本文途中) -->
                <div class="cta-section">
                    <h2 class="cta-title">症状を整理するツール</h2>
                    <p class="cta-desc">以下のツールで症状を整理した受診用レポートを作成できます。</p>
                    <a href="index.html" style="text-decoration: none;">
                        <button class="btn-primary" style="width: auto; padding: 12px 30px; display: inline-block;">受診用レポートを作る</button>
                    </a>
                </div>

                <div class="landing-section">
                    <h2 class="context-title" style="font-size: 1.1rem;">3. 動物病院に伝えるとよい情報</h2>
                    <p class="instruction" style="color: var(--text-main); margin-bottom: 0;">{what_to_tell}</p>
                </div>

                <h2 class="h2-title">よくあるご質問（FAQ）</h2>
                <div class="faq-item">
                    <div class="faq-q"><span>Q.</span><span>この症状はすぐ病院に行くべき？</span></div>
                    <div class="faq-a"><span>A.</span><span>症状の強さや持続時間によって異なります。気になる場合は早めに動物病院に相談してください。</span></div>
                </div>
                <div class="faq-item">
                    <div class="faq-q"><span>Q.</span><span>このツールは診断をしますか？</span></div>
                    <div class="faq-a"><span>A.</span><span>診断ではなく症状整理を目的としたツールです。</span></div>
                </div>

                <h2 class="h2-title">関連症状</h2>
                <div class="related-links">
                    <a href="{pet_en}-vomiting.html" class="related-link">吐く</a>
                    <a href="{pet_en}-diarrhea.html" class="related-link">下痢</a>
                    <a href="{pet_en}-no-appetite.html" class="related-link">食欲不振</a>
                    <a href="{pet_en}-cough.html" class="related-link">咳</a>
                    <a href="{pet_en}-urination-problem.html" class="related-link">排尿異常</a>
                </div>

                <!-- CTA 2 (ページ末尾) -->
                <div class="cta-section" style="margin-bottom: 0;">
                    <h2 class="cta-title">症状を整理するツール</h2>
                    <p class="cta-desc">以下のツールで症状を整理した受診用レポートを作成できます。</p>
                    <a href="index.html" style="text-decoration: none;">
                        <button class="btn-primary" style="width: auto; padding: 12px 30px; display: inline-block;">受診用レポートを作る</button>
                    </a>
                </div>

            </div>
        </div>
    </div>
</body>
</html>"""

def build_pages():
    symptoms = [
        {"id": "vomiting", "name": "吐く", "overview": "{pet}が吐く症状は、一過性のものから重篤な病気のサインまで様々です。吐き気があるのか、実際に吐き出しているのかを確認しましょう。", "causes": "食べすぎ、誤飲、胃腸炎、感染症、内臓疾患など。", "what_to_tell": "吐いた回数、時間帯、吐しゃ物の内容（フード、泡、血など）、下痢や元気消失などの他の症状の有無。"},
        {"id": "diarrhea", "name": "下痢", "overview": "{pet}の下痢は、便がゆるい状態から水のような状態まで様々です。急性の下痢は体力を激しく消耗させることがあります。", "causes": "消化不良、食事の変更、寄生虫、ストレス、ウイルス感染、内臓疾患など。", "what_to_tell": "下痢の回数、便の硬さ（水様、泥状など）、色、血便の有無、ゼリー状の粘液が混ざっているか。"},
        {"id": "no-appetite", "name": "食欲不振", "overview": "{pet}がご飯を食べない場合、単なる好き嫌いから病気の初期症状まで多くの可能性があります。丸1日以上食べない場合は注意が必要です。", "causes": "感染症による発熱、口内炎や歯周病による痛み、内臓疾患、ストレス、夏バテなど。", "what_to_tell": "いつから食べていないか、水は飲んでいるか、おやつなら食べるか、他に気になる症状はあるか。"},
        {"id": "cough", "name": "咳", "overview": "{pet}の咳は、喉に何かが詰まったような「カッカッ」という音や、乾いた音、湿った音など様々です。", "causes": "呼吸器系の感染症（気管支炎など）、心臓病、アレルギー、異物の誤飲など。", "what_to_tell": "咳の音の様子、咳が出るタイミング（興奮時、朝晩など）、呼吸は苦しそうか、運動を嫌がるか。"},
        {"id": "urination-problem", "name": "排尿異常", "overview": "{pet}の排尿異常には、トイレに行くのに尿が出ない、頻尿、血尿、粗相などがあります。特に尿が全く出ない場合は緊急性が高いです。", "causes": "膀胱炎、尿路結石、腎臓病、ストレスによる特発性膀胱炎など。", "what_to_tell": "おしっコの回数、1回の量、血が混じっているか、トイレで痛そうに鳴くか、全く出ていない時間。"}
    ]
    
    pets = [{"en": "dog", "ja": "犬"}, {"en": "cat", "ja": "猫"}]
    
    # Save the raw template as symptom-template.html
    with open("c:/Users/user/Desktop/20260304 new business idea test/symptom-template.html", "w", encoding='utf-8') as f:
        f.write(TEMPLATE.replace('{title}', '症状タイトル').replace('{description}', '症状の概要').replace('{h1}','症状タイトル').replace('{intro}','症状についての簡単な説明（150〜250文字）').replace('{symptom_name}','症状').replace('{overview}','概要').replace('{causes}','原因').replace('{what_to_tell}','伝えるべき情報').replace('{pet_en}','dog'))

    pages = []
    
    for pet in pets:
        for symp in symptoms:
            filename = f"{pet['en']}-{symp['id']}.html"
            pages.append(filename)
            
            title = f"{pet['ja']}が{symp['name']}ときの対処法と動物病院で伝えるべきこと｜ペット症状整理ツール"
            desc = f"{pet['ja']}が{symp['name']}ときの考えられる原因や、動物病院に行く前に確認すべきポイントを解説。症状を整理する無料レポート作成ツールも利用できます。"
            h1 = f"{pet['ja']}が{symp['name']}ときに整理しておきたい情報"
            intro = f"{pet['ja']}が{symp['name']}場合、ご家族としては非常に心配になるかと思います。ここでは、考えられる原因と、獣医師に的確に状況を伝えるためのチェックポイントを解説します。"
            
            content = TEMPLATE.format(
                title=title,
                description=desc,
                h1=h1,
                intro=intro,
                symptom_name=symp['name'],
                overview=symp['overview'].format(pet=pet['ja']),
                causes=symp['causes'],
                what_to_tell=symp['what_to_tell'],
                pet_en=pet['en']
            )
            
            path = os.path.join("c:/Users/user/Desktop/20260304 new business idea test", filename)
            with open(path, "w", encoding='utf-8') as f:
                f.write(content)
                
    # Generate Sitemap
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    all_urls = ["index.html", "vet-visit-preparation.html"] + pages
    DOMAIN = "https://example.com/" # Generic placeholder domain as usually done for MVP sitemaps unless specified
    
    for url in all_urls:
        sitemap_xml += f"  <url>\n    <loc>{DOMAIN}{url}</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n"
        
    sitemap_xml += "</urlset>"
    
    sitemap_path = os.path.join("c:/Users/user/Desktop/20260304 new business idea test", "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(sitemap_xml)
        
    print(f"Generated {len(pages)} LPs, 1 template, and 1 sitemap.")

if __name__ == "__main__":
    build_pages()
