import { DecisionSummaryPanel } from "./DecisionSummaryPanel";
import {
  SafetyFlagsPanel,
  type ResearchReviewSafetyFlags,
} from "./SafetyFlagsPanel";

export type ResearchReviewPacket = ResearchReviewSafetyFlags & {
  packet_id: string;
  packet_label: string;
  review_queue_id: string;
  decision_index_id: string;
  bundle_count: number;
  decision_count: number;
  decision_summary: {
    rejected_count: number;
    needs_data_review_count: number;
    approved_for_paper_research_count: number;
  };
  included_sections: string[];
  checksums: {
    queue_checksum: string;
    decision_checksums: string[];
    index_checksum: string;
    packet_checksum: string;
  };
  reproducibility_hash: string;
  warnings: string[];
};

type ResearchReviewPacketPanelProps = {
  packet: ResearchReviewPacket;
  available: boolean;
  error?: string;
};

export function ResearchReviewPacketPanel({
  packet,
  available,
  error,
}: ResearchReviewPacketPanelProps) {
  return (
    <section className="packet-section" aria-labelledby="packet-title">
      <div className="section-heading">
        <p className="eyebrow">Research Review Packet</p>
        <h2 id="packet-title">Read-only reviewer handoff</h2>
      </div>
      {!available ? (
        <p className="notice warn">
          Backend sample packet unavailable. Rendering paper-safe fallback: {error}
        </p>
      ) : null}

      <div className="packet-layout">
        <article className="panel packet-overview">
          <div>
            <p className="card-kicker">Packet Identity</p>
            <h3>{packet.packet_label}</h3>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Packet ID</dt>
              <dd>{packet.packet_id}</dd>
            </div>
            <div>
              <dt>Review queue</dt>
              <dd>{packet.review_queue_id}</dd>
            </div>
            <div>
              <dt>Decision index</dt>
              <dd>{packet.decision_index_id}</dd>
            </div>
            <div>
              <dt>Bundles</dt>
              <dd>{packet.bundle_count}</dd>
            </div>
          </dl>
        </article>

        <DecisionSummaryPanel
          decisionCount={packet.decision_count}
          summary={packet.decision_summary}
        />

        <SafetyFlagsPanel flags={packet} />
      </div>

      <div className="packet-layout secondary">
        <article className="packet-subpanel">
          <div>
            <p className="card-kicker">Sections</p>
            <h3>Included metadata</h3>
          </div>
          <ul className="pill-list">
            {packet.included_sections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>
        </article>

        <article className="packet-subpanel">
          <div>
            <p className="card-kicker">Checksums</p>
            <h3>Audit references</h3>
          </div>
          <dl className="checksum-list">
            <div>
              <dt>Queue</dt>
              <dd>{formatChecksum(packet.checksums.queue_checksum)}</dd>
            </div>
            <div>
              <dt>Decision index</dt>
              <dd>{formatChecksum(packet.checksums.index_checksum)}</dd>
            </div>
            <div>
              <dt>Packet</dt>
              <dd>{formatChecksum(packet.checksums.packet_checksum)}</dd>
            </div>
            <div>
              <dt>Reproducibility</dt>
              <dd>{formatChecksum(packet.reproducibility_hash)}</dd>
            </div>
          </dl>
        </article>

        <article className="packet-subpanel">
          <div>
            <p className="card-kicker">Warnings</p>
            <h3>Review notes</h3>
          </div>
          <ul className="warning-list">
            {packet.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function formatChecksum(value: string): string {
  if (value.length <= 24) {
    return value;
  }
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}
