import { requireAdmin } from "@/lib/auth";
import { waHref } from "@/lib/phone";
import { nd } from "@/lib/lang";

export default async function AdminGuidePage() {
  await requireAdmin();
  const supportPhone = "9700042694";

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="admin-header">
        <h1 className="admin-header__title">व्यवस्थापन प्रयोग गाइड (User Guide)</h1>
        <p className="admin-header__sub">
          निश्चल कानूनी कार्यालयको वेबसाइट व्यवस्थापन तथा सामग्री सम्पादन सम्बन्धी जानकारी
        </p>
      </div>

      {/* Intro Note */}
      <div
        className="admin-card"
        style={{
          backgroundColor: "#f0f4fc",
          borderColor: "#c9d8f5",
          marginBottom: "28px",
        }}
      >
        <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6, color: "var(--ink)" }}>
          <strong>आदरणीय अधिवक्ताज्यू, नमस्कार !</strong><br />
          यो व्यवस्थापन प्यानल तपाईंले आफ्नो मोबाइल वा कम्प्युटरबाट कार्यालयको सम्पूर्ण विवरण, सेवा, शुल्क, सूचना र तस्बिरहरू सजिलै थपघट तथा सम्पादन गर्नका लागि तयार गरिएको हो। तल दिइएका निर्देशनहरूले तपाईंलाई सजिलो बनाउनेछ।
        </p>
      </div>

      {/* Section 1: Login */}
      <div className="admin-card">
        <h2 className="admin-card__title">१. लगइन गर्ने तरिका (How to Login)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
          वेबसाइटको ठेगानामा <code>/admin</code> लेखेर इन्टर गर्नुहोस् (जस्तै: <code>your-site.com/admin</code>)। त्यहाँ आफ्नो प्रयोगकर्ताको नाम (Username) र पासवर्ड हालेर <strong>&quot;लगइन गर्नुहोस्&quot;</strong> बटन थिच्नुहोस्। सुरक्षाका लागि ८ पटकभन्दा बढी गलत पासवर्ड हालेमा खाता १५ मिनेटका लागि स्वतः बन्द हुनेछ।
        </p>
      </div>

      {/* Section 2: Editing Content */}
      <div className="admin-card">
        <h2 className="admin-card__title">२. सामग्री सम्पादन (Editing Sections)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", marginBottom: "16px" }}>
          बायाँपट्टिको मेनु (वा मोबाइलमा माथिको छनोट मेनु) बाट तपाईंले सम्पादन गर्न चाहेको खण्ड छनोट गर्नुहोस्:
        </p>

        <ul style={{ paddingLeft: "20px", fontSize: "0.9375rem", lineHeight: 1.8, color: "var(--ink)" }}>
          <li>
            <strong>सेटिङहरू (Settings):</strong> कार्यालयको नाम, फोन, मोबाइल, ठेगाना, समय, गुगल नक्सा, माथिल्लो रातो सूचना ब्यानर र SEO सम्पादन गर्न।
          </li>
          <li>
            <strong>मुख्य ब्यानर (Hero):</strong> गृहपृष्ठको पहिलो ठूलो शीर्षक, उप-शीर्षक र मुख्य ३ वटा बुँदाहरू परिवर्तन गर्न।
          </li>
          <li>
            <strong>सेवाहरू (Services):</strong> ९ वटै कानुनी सेवाहरूको नाम, विवरण, नयाँ सेवा थप्ने वा क्रम मिलाउने काम गर्न।
          </li>
          <li>
            <strong>आवश्यक कागजात (Docs):</strong> विभिन्न कामका लागि सेवाग्राहीले ल्याउनुपर्ने कागजातका बुँदाहरू र कानुनी सूचना सम्पादन गर्न।
          </li>
          <li>
            <strong>प्रक्रिया (Procedure):</strong> कार्यालयमा काम सम्पन्न हुने चरणबद्ध कार्यविधिहरू सम्पादन गर्न।
          </li>
          <li>
            <strong>परिचय (About):</strong> तपाईंको व्यक्तिगत विवरण, पद, विस्तृत परिचय, फोटो र ट्यागहरू सम्पादन गर्न।
          </li>
          <li>
            <strong>तस्बिरहरू (Gallery):</strong> कार्यालयका तस्बिरहरू, क्याप्सन सम्पादन गर्न र नयाँ तस्बिरहरू थप्न।
          </li>
          <li>
            <strong>बटन र शब्दहरू (Labels):</strong> मेनु, कल बटन र वेबसाइटका साना लेबुलहरू परिवर्तन गर्न।
          </li>
          <li>
            <strong>सन्देशहरू (Messages):</strong> सेवाग्राहीहरूले वेबसाइटबाट पठाएका सोधपुछ तथा सन्देशहरू हेर्न, पढिएको जनाउन र हटाउन।
          </li>
        </ul>
      </div>

      {/* Section 3: Photo Uploads */}
      <div className="admin-card">
        <h2 className="admin-card__title">३. फोटो थप्ने र हटाउने (Photos & Uploads)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
          तपाईंले आफ्नो मोबाइलबाट खिचेको फोटो सिधै अपलोड गर्न सक्नुहुन्छ। फोटो JPEG, PNG वा WebP ढाँचामा हुनुपर्छ र अधिकतम ८ MB सम्मको हुनुपर्छ। ग्यालरी खण्डमा एकैपटक धेरै फोटोहरू छानेर अपलोड गर्न सकिन्छ। पुरानो फोटो फेर्दा वा हटाउँदा अनावश्यक फाइल स्वतः सुरक्षित रूपमा हट्नेछ।
        </p>
      </div>

      {/* Section 4: Save Banner */}
      <div className="admin-card">
        <h2 className="admin-card__title">४. &quot;सेभ भयो&quot; हरियो ब्यानर (Saved Banner Meaning)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
          कुनै पनि परिवर्तन गरेपछि <strong>&quot;सेभ गर्नुहोस्&quot;</strong> बटन थिच्दा माथि हरियो रंगमा <strong>&quot;✓ सेभ भयो (Saved)&quot;</strong> लेखिएको ब्यानर आउँछ। यसको अर्थ तपाईंको नयाँ जानकारी डाटाबेसमा सुरक्षित भइसकेको छ र मुख्य वेबसाइटमा तुरुन्तै लागू भएको छ।
        </p>
      </div>

      {/* Section 5: Restoring Mistakes */}
      <div className="admin-card">
        <h2 className="admin-card__title">५. गल्ती भयो भने — चिन्ता नलिनुहोस् ! (Advanced → Restore)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
          यदि सामग्री सम्पादन गर्दा कुनै गल्ती भयो वा पुरानै विवरण फर्काउन मन लाग्यो भने नआत्तिनुहोस्। तपाईंले प्रत्येक पटक सेभ गर्दा प्रणालीले पहिलेको सामग्रीको सुरक्षित प्रतिलिपि (Backup) राख्छ। मेनुबाट <strong>&quot;उन्नत / ब्याकअप (Advanced)&quot;</strong> मा जानुहोस् र तल दिइएका ब्याकअपहरूको सूचीबाट आफूलाई चाहिएको मितिको छेउमा रहेको <strong>&quot;रिस्टोर गर्नुहोस् (Restore)&quot;</strong> बटन थिच्नुहोस्। वेबसाइट तुरुन्तै पुरानै अवस्थामा फर्किनेछ।
        </p>
      </div>

      {/* Section 6: Password Change */}
      <div className="admin-card">
        <h2 className="admin-card__title">६. पासवर्ड परिवर्तन (Change Password)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
          सुरक्षाका लागि समय–समयमा पासवर्ड परिवर्तन गर्नु राम्रो हुन्छ। मेनुबाट <strong>&quot;पासवर्ड परिवर्तन&quot;</strong> मा गएर हालको पासवर्ड र कम्तीमा ८ वर्णको नयाँ पासवर्ड दुई पटक हालेर सुरक्षित गर्नुहोस्। नयाँ पासवर्ड कतै सुरक्षित टिपेर राख्नुहोला।
        </p>
      </div>

      {/* Section 7: Support Contact */}
      <div
        className="admin-card"
        style={{
          borderLeft: "4px solid var(--blue)",
        }}
      >
        <h2 className="admin-card__title">७. समस्या परेमा प्राविधिक सम्पर्क (Support)</h2>
        <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
          वेबसाइट सम्बन्धी कुनै पनि प्राविधिक कठिनाइ, थप सुविधा आवश्यक परेमा वा सहयोग चाहिएमा जुनसुकै बेला सम्पर्क गर्न सक्नुहुन्छ:
          <br /><br />
          <strong>विकासकर्ता:</strong> Zetroxy (Aaditya Chhetri)<br />
          <strong>ह्वाट्सएप:</strong>{" "}
          <a
            href={waHref(supportPhone)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--blue)", fontWeight: 600 }}
          >
            {nd(supportPhone, "ne")} ↗
          </a>
        </p>
      </div>
    </div>
  );
}
