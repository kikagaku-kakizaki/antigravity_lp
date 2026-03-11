document.addEventListener('DOMContentLoaded', () => {
    // スムーズスクロール (iOS等でのフォールバックのため)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80; // ヘッダーの高さ分オフセット
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observerを利用したスクロールアニメーション
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 一度発火したら監視を解除する場合
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(element => {
        observer.observe(element);
    });

    // フォーム送信処理 (Google Apps Script連携)
    // 注意: 下記のURLを、作成したGASのウェブアプリURL(デプロイURL)に置き換えてください。
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbyq67GP84CtzLPpGAGGQhR-U2Gb41rwtTGZbZNHteYe45Td7z0N1NcGgpSs5hU5nB6T5g/exec';
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const loader = submitBtn ? submitBtn.querySelector('.loader') : null;
    const formMessage = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UIを送信中状態にする
            submitBtn.disabled = true;
            btnText.style.opacity = '0';
            loader.style.display = 'block';
            formMessage.style.display = 'none';

            // フォームデータの収集
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                // GASとの通信（CORSのOPTIONS通信を避けるためtext/plainを使用します）
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(data),
                });

                // 正常に「全員」権限でデプロイされていればJSONが返ってきます。
                // 権限が不足していると、ログインページのHTMLが返りパースエラーまたはCORSエラーになります。
                const result = await response.json();

                if (result.status === 'success') {
                    showMessage('success', '送信が完了しました。担当者より折り返しご連絡いたします。');
                    form.reset();
                } else {
                    throw new Error(result.message || 'Unknown server error');
                }
            } catch (error) {
                console.error('Error!', error.message);
                // fetch に失敗した場合（no-corsを使用して実質送信できたとしてもCORSでエラーブロックされた場合へのフォールバック等）
                showMessage('error', '送信に失敗しました。時間をおいて再度お試しください。');
            } finally {
                // UIを元の状態に戻す
                submitBtn.disabled = false;
                btnText.style.opacity = '1';
                loader.style.display = 'none';
            }
        });
    }

    function showMessage(type, text) {
        if (!formMessage) return;
        formMessage.className = `form-message ${type}`;
        formMessage.textContent = text;
        formMessage.style.display = 'block';
    }
});
