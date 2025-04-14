import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox image="/images/task2.png" title="Oppgave 2">
      <ul>
        <p>
          Okey, så denne oppgaven er litt simpel, men utrolig nyttig i forhold til RAG samt det å
          utvide grafen. Du trenger ikke bruke kjempe mye tid på prompt engineering. Etter litt
          prøving og feiling finner du prompts i kokeboka. For å få best resultater fra semantisk
          søk, bør man embedde en setning som best fanger betydningen man sammenligner med. Hvis en
          chat har lang historikk kan andre tema påvirke følgende semantiske søk, mens hvis man kun
          søker basert på siste melding kan det være man mister ting setningen refererer til fra
          historikken, som når en bruker spør “hva betyr den forkortelsen?“. Derfor kan man først gi
          chathistorikken til en språkmodell og be den lage et selvstendig spørsmål, som “hva betyr
          forkortelsen ABC?“.
        </p>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat/task2"
      emptyStateComponent={InfoCard}
      showIntermediateStepsToggle={true}
    />
  );
}
