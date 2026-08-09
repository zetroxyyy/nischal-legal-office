import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { updateLabelsAction } from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminLabelsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();
  const ui = content.ui;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">बटन तथा शब्दहरू सम्पादन (UI Labels)</h1>
        <p className="admin-header__sub">
          वेबसाइटको नेभिगेसन मेनु, बटन र साना लेबुलहरूका नेपाली र अंग्रेजी शब्दहरू
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateLabelsAction}>
        {/* Navigation Labels */}
        <div className="admin-card">
          <h2 className="admin-card__title">नेभिगेसन मेनु शब्दहरू (Navigation Links)</h2>
          <BilingualField
            labelNe="गृहपृष्ठ लिंक"
            labelEn="Home Nav Link"
            namePrefix="nav_home"
            valueNe={ui.nav_home.ne}
            valueEn={ui.nav_home.en}
            required
          />
          <BilingualField
            labelNe="सेवा तथा प्रक्रिया लिंक"
            labelEn="Services Nav Link"
            namePrefix="nav_services"
            valueNe={ui.nav_services.ne}
            valueEn={ui.nav_services.en}
            required
          />
          <BilingualField
            labelNe="सम्पर्क लिंक"
            labelEn="Contact Nav Link"
            namePrefix="nav_contact"
            valueNe={ui.nav_contact.ne}
            valueEn={ui.nav_contact.en}
            required
          />
        </div>

        {/* Buttons */}
        <div className="admin-card">
          <h2 className="admin-card__title">कार्य बटनहरू (Action Buttons)</h2>
          <BilingualField
            labelNe="फोन कल बटन"
            labelEn="Call Button"
            namePrefix="call"
            valueNe={ui.call.ne}
            valueEn={ui.call.en}
            required
          />
          <BilingualField
            labelNe="ह्वाट्सएप बटन"
            labelEn="WhatsApp Button"
            namePrefix="whatsapp"
            valueNe={ui.whatsapp.ne}
            valueEn={ui.whatsapp.en}
            required
          />
          <BilingualField
            labelNe="बाटो हेर्ने (दिशा) बटन"
            labelEn="Directions Button"
            namePrefix="directions"
            valueNe={ui.directions.ne}
            valueEn={ui.directions.en}
            required
          />
          <BilingualField
            labelNe="गुगल नक्सामा खोल्नुहोस् लिंक"
            labelEn="Open in Map Link"
            namePrefix="open_map"
            valueNe={ui.open_map.ne}
            valueEn={ui.open_map.en}
            required
          />
          <BilingualField
            labelNe="सबै सेवाहरू हेर्नुहोस् लिंक"
            labelEn="All Services Link"
            namePrefix="all_services"
            valueNe={ui.all_services.ne}
            valueEn={ui.all_services.en}
            required
          />
          <BilingualField
            labelNe="थप तस्बिरहरू लिंक"
            labelEn="More Photos Link"
            namePrefix="more_photos"
            valueNe={ui.more_photos.ne}
            valueEn={ui.more_photos.en}
            required
          />
        </div>

        {/* Contact Info Labels */}
        <div className="admin-card">
          <h2 className="admin-card__title">सम्पर्क लेबुलहरू (Contact Labels)</h2>
          <BilingualField
            labelNe="टेलिफोन लेबुल"
            labelEn="Landline Phone Label"
            namePrefix="phone_label"
            valueNe={ui.phone_label.ne}
            valueEn={ui.phone_label.en}
            required
          />
          <BilingualField
            labelNe="मोबाइल लेबुल"
            labelEn="Mobile Phone Label"
            namePrefix="mobile_label"
            valueNe={ui.mobile_label.ne}
            valueEn={ui.mobile_label.en}
            required
          />
          <BilingualField
            labelNe="इमेल लेबुल"
            labelEn="Email Label"
            namePrefix="email_label"
            valueNe={ui.email_label.ne}
            valueEn={ui.email_label.en}
            required
          />
          <BilingualField
            labelNe="कार्यालय समय लेबुल"
            labelEn="Hours Label"
            namePrefix="hours_label"
            valueNe={ui.hours_label.ne}
            valueEn={ui.hours_label.en}
            required
          />
          <BilingualField
            labelNe="ठेगाना लेबुल"
            labelEn="Address Label"
            namePrefix="address_label"
            valueNe={ui.address_label.ne}
            valueEn={ui.address_label.en}
            required
          />
          <BilingualField
            labelNe="चिनारी लेबुल"
            labelEn="Landmark Label"
            namePrefix="landmark_label"
            valueNe={ui.landmark_label.ne}
            valueEn={ui.landmark_label.en}
            required
          />
          <BilingualField
            labelNe="भुक्तानी लेबुल"
            labelEn="Payment Label"
            namePrefix="payment_label"
            valueNe={ui.payment_label.ne}
            valueEn={ui.payment_label.en}
            required
          />
          <BilingualField
            labelNe="क्रेडिट लेबुल (फुटर)"
            labelEn="Credit Label"
            namePrefix="credit"
            valueNe={ui.credit.ne}
            valueEn={ui.credit.en}
            required
          />
        </div>

        {/* Contact Form Labels */}
        <div className="admin-card">
          <h2 className="admin-card__title">सम्पर्क फारमका शब्दहरू (Contact Form Labels)</h2>
          <BilingualField
            labelNe="नाम फिल्ड लेबुल"
            labelEn="Name Field Label"
            namePrefix="form_name"
            valueNe={ui.form_name?.ne ?? "नाम"}
            valueEn={ui.form_name?.en ?? "Name"}
            required
          />
          <BilingualField
            labelNe="फोन फिल्ड लेबुल"
            labelEn="Phone Field Label"
            namePrefix="form_phone"
            valueNe={ui.form_phone?.ne ?? "फोन / मोबाइल"}
            valueEn={ui.form_phone?.en ?? "Phone"}
            required
          />
          <BilingualField
            labelNe="सन्देश फिल्ड लेबुल"
            labelEn="Message Field Label"
            namePrefix="form_message"
            valueNe={ui.form_message?.ne ?? "सन्देश"}
            valueEn={ui.form_message?.en ?? "Message"}
            required
          />
          <BilingualField
            labelNe="पठाउनुहोस् बटन लेबुल"
            labelEn="Send Button Label"
            namePrefix="form_send"
            valueNe={ui.form_send?.ne ?? "सन्देश पठाउनुहोस्"}
            valueEn={ui.form_send?.en ?? "Send message"}
            required
          />
          <BilingualField
            labelNe="सफलता सन्देश (Success Notice)"
            labelEn="Success Message"
            namePrefix="form_success"
            valueNe={ui.form_success?.ne ?? "तपाईंको सन्देश प्राप्त भयो । धन्यवाद !"}
            valueEn={ui.form_success?.en ?? "Your message has been received. Thank you!"}
            isTextarea
            required
          />
          <BilingualField
            labelNe="त्रुटि सन्देश (Error Notice)"
            labelEn="Error Message"
            namePrefix="form_error"
            valueNe={ui.form_error?.ne ?? "माफ गर्नुहोस्, सन्देश पठाउन सकिएन । फेरि प्रयास गर्नुहोस् ।"}
            valueEn={ui.form_error?.en ?? "Sorry, the message could not be sent. Please try again."}
            isTextarea
            required
          />
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save UI Labels)
          </button>
        </div>
      </form>
    </div>
  );
}
