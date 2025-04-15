import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox image="/images/task3.png" title="Oppgave 3">
      <ul>
        <p>
          Husk å kjøre: <code>npm run db</code> OG <code>npx prisma studio</code> før du starter
        </p>
        <p>
          Okey, lynet mcqueen da er det tid for RAG. Det kan være fint å ta utgangspunkt i oppgave
          du har gjort allerede og utvide grafen din. Last opp knappen baserer seg bare på tekst i
          første omgang som ligger i <code>data/DefaultRetrievalText.ts</code>. Det som er med RAG
          er at om vi har en spesifikk tema er det lettere å få til en god RAG, i tilfellet her
          bruker vi data fra hjemmesiden deres. Da kan man skrive prompten slik at den kan man
          skrive prompten slik at den er mer relevant for temaet.
        </p>
        <p>
          Se hvordan data blir gjort om til vektorer (embeddings) i{" "}
          <code>app/api/retrieval/ingest/route.ts</code>.
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
