// FAQSection.jsx
import FAQItem from "./FAQItem";

export default function FAQSection({ faqs }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold text-lg mb-4">Popular Questions</h2>
            {faqs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} />
            ))}
        </div>
    );
}