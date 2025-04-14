import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox image="/images/task3.png" title="Oppgave 3">
      <ul>
        <p>
          Kjør: <code>npm run db</code>{" "}
        </p>
        <p>
          Okey, lynet mcqueen da er det tid for RAG. Det kan være fint å ta utgangspunkt i oppgave
          du har gjort allerede og utvide grafen din. Så last opp knappen baserer seg bare på tekst
          i første omgang. I teorien bli bare teksten fra filer hentet ut så vi dropper dette. Det
          som er med RAG er at om vi har en spesifikk tema er det lettere å få til en god RAG. Da
          kan man skrive prompten slik at den er mer relevant for temaet. Se hvordan data blir gjort
          om til vektorer (embeddings) i <code>app/api/retrieval/ingest/route.ts</code>.
        </p>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat/task3"
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      showIntermediateStepsToggle={true}
    />
  );
}
