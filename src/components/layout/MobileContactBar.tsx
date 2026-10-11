import { PhoneIcon, WhatsAppIcon } from '@/components/ui/icons'
import { getBrand } from '@/lib/brand/get-brand'
import { telHref, whatsappHref } from '@/lib/contact'

/** Floating Call / WhatsApp actions on phones (thumb zone), hidden from md up. */
export async function MobileContactBar() {
  const brand = await getBrand()
  return (
    <div
      data-mobile-contact
      className="pointer-events-none fixed inset-x-0 bottom-0 z-(--z-sticky) flex justify-end gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-(--duration-base) ease-out-expo md:hidden"
    >
      <a
        href={telHref(brand.contact.phone)}
        aria-label={`Call ${brand.contact.phone}`}
        data-analytics="call_click"
        className="pointer-events-auto grid size-14 place-items-center rounded-full border border-border bg-surface-raised text-text shadow-lg"
      >
        <PhoneIcon className="size-6" />
      </a>
      <a
        href={whatsappHref(brand.contact.whatsapp, `Hi ${brand.name}, I'd like to plan catering for an event.`)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        data-analytics="whatsapp_click"
        className="pointer-events-auto grid size-14 place-items-center rounded-full bg-secondary-fill text-on-secondary shadow-lg"
      >
        <WhatsAppIcon className="size-6" />
      </a>
    </div>
  )
}
