import { CLASSES, PATHS } from '../catalog.js';
import { AccentButton, PATH_LABEL } from '../components/ui.jsx';
import { formatDate, skillReady } from '../logic.js';
import { useGame } from '../state.jsx';

function readyNode(node, tier) {
  return skillReady(
    {
      ...node,
      requires: node.requires || [{ stat: node.stat, tier: node.tier }],
    },
    tier,
  );
}

function SkillRow({ node, accent }) {
  const game = useGame();
  const achieved = game.state.skills[node.id];
  const ready = !achieved && readyNode(node, game.state.stats.tier);
  return (
    <div data-testid={`skill-${node.id}`} className="mb-2 flex items-center justify-between gap-2 border-b border-line py-2">
      <p className={`font-body text-[14px] font-normal leading-none ${achieved || ready ? 'text-primary' : 'text-muted'}`}>{node.name}</p>
      {achieved ? (
        <p data-testid={`skill-date-${node.id}`} className="font-body text-[12px] font-normal leading-none text-muted">
          {formatDate(achieved)}
        </p>
      ) : null}
      {ready ? (
        accent ? (
          <AccentButton testId={`confirm-${node.id}`} onClick={() => game.confirmSkill(node.id)}>
            Confirm
          </AccentButton>
        ) : (
          <button type="button" data-testid={`confirm-${node.id}`} onClick={() => game.confirmSkill(node.id)} className="font-body text-[14px] font-normal text-primary">
            Confirm
          </button>
        )
      ) : null}
    </div>
  );
}

function pathNodes(path) {
  return path.nodes.map((node) => ({ ...node, stat: path.stat }));
}

export function Skills() {
  const game = useGame();
  const tier = game.state.stats.tier;
  const skills = game.state.skills;
  const classAccent = CLASSES.find((node) => !skills[node.id] && readyNode(node, tier))?.id;
  let pathAccent = null;
  if (!classAccent) {
    for (const path of PATHS) {
      pathAccent = pathNodes(path).find((node) => !skills[node.id] && readyNode(node, tier))?.id || null;
      if (pathAccent) break;
    }
  }
  const accentId = classAccent || pathAccent;
  return (
    <div className="pb-8">
      <section className="px-4 pt-4">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Classes</h2>
        <div className="mt-2">
          {CLASSES.map((node) => (
            <SkillRow key={node.id} node={node} accent={node.id === accentId} />
          ))}
        </div>
      </section>
      <section className="px-4 pt-8">
        <h2 className="font-body text-[13px] font-medium leading-none text-muted">Paths</h2>
        <div className="mt-2">
          {PATHS.map((path) => (
            <div key={path.id} className="mb-4">
              <p data-testid={`path-${path.id}`} className="font-body text-[14px] font-normal text-primary">
                {PATH_LABEL[path.id]}
              </p>
              {pathNodes(path).map((node) => (
                <div key={node.id} data-testid={`node-${path.id}-T${node.tier}`}>
                  <SkillRow node={{ ...node, name: `T${node.tier}` }} accent={node.id === accentId} />
                  {node.id === 'thunderclap' && game.state.body?.heightCm ? (
                    <p data-testid="height-mark" className="font-body text-[12px] font-normal text-muted">
                      {Math.round(game.state.body.heightCm)} cm
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
