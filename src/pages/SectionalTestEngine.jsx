import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import MathText from '../components/MathText';
import { LogoIcon } from '../components/Icons';
import IMUpilotSidebar from '../components/IMUpilotSidebar';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function createChapters(subjectId, classLevel, names, orderOffset = 0) {
  return names.map((name, index) => ({
    id: `${subjectId.toLowerCase().replaceAll(' ', '-')}-${classLevel ? `class-${classLevel.toLowerCase()}-` : ''}${index + 1}`,
    name,
    classLevel,
    order: orderOffset + index + 1,
  }));
}

const SUBJECTS = [
  {
    id: 'Physics', label: 'Physics', color: '#0F172A', bg: '#F1F5F9', icon: '⚡',
    chapters: [
      ...createChapters('Physics', 'XI', [
        'Units and Measurements',
        'Motion in a Straight Line',
        'Motion in a Plane',
        'Laws of Motion',
        'Work, Energy and Power',
        'System of Particles and Rotational Motion',
        'Gravitation',
        'Mechanical Properties of Solids',
        'Mechanical Properties of Fluids',
        'Thermal Properties of Matter',
        'Thermodynamics',
        'Kinetic Theory',
        'Oscillations',
        'Waves',
      ]),
      ...createChapters('Physics', 'XII', [
        'Electric Charges and Fields',
        'Electrostatic Potential and Capacitance',
        'Current Electricity',
        'Moving Charges and Magnetism',
        'Magnetism and Matter',
        'Electromagnetic Induction',
        'Alternating Current',
        'Electromagnetic Waves',
        'Ray Optics and Optical Instruments',
        'Wave Optics',
        'Dual Nature of Radiation and Matter',
        'Atoms',
        'Nuclei',
        'Semiconductor Electronics',
      ], 14),
    ],
  },
  {
    id: 'Chemistry', label: 'Chemistry', color: '#0F172A', bg: '#F1F5F9', icon: '🧪',
    chapters: [
      ...createChapters('Chemistry', 'XI', [
        'Some Basic Concepts of Chemistry',
        'Structure of Atom',
        'Classification of Elements and Periodicity',
        'Chemical Bonding and Molecular Structure',
        'Chemical Thermodynamics',
        'Equilibrium',
        'Redox Reactions',
        'Organic Chemistry — Basic Principles and Techniques',
        'Hydrocarbons',
      ]),
      ...createChapters('Chemistry', 'XII', [
        'Solutions',
        'Electrochemistry',
        'Chemical Kinetics',
        'd- and f-Block Elements',
        'Coordination Compounds',
        'Haloalkanes and Haloarenes',
        'Alcohols, Phenols and Ethers',
        'Aldehydes, Ketones and Carboxylic Acids',
        'Amines',
        'Biomolecules',
      ], 9),
    ],
  },
  {
    id: 'Mathematics', label: 'Mathematics', color: '#0F172A', bg: '#F1F5F9', icon: '📐',
    chapters: [
      ...createChapters('Mathematics', 'XI', [
        'Sets',
        'Relations and Functions',
        'Trigonometric Functions',
        'Complex Numbers and Quadratic Equations',
        'Linear Inequalities',
        'Permutations and Combinations',
        'Binomial Theorem',
        'Sequence and Series',
        'Straight Lines',
        'Conic Sections',
        'Introduction to Three-Dimensional Geometry',
        'Limits and Derivatives',
        'Statistics',
        'Probability',
      ]),
      ...createChapters('Mathematics', 'XII', [
        'Relations and Functions',
        'Inverse Trigonometric Functions',
        'Matrices',
        'Determinants',
        'Continuity and Differentiability',
        'Applications of Derivatives',
        'Integrals',
        'Applications of Integrals',
        'Differential Equations',
        'Vector Algebra',
        'Three-Dimensional Geometry',
        'Linear Programming',
        'Probability',
      ], 14),
    ],
  },
  {
    id: 'English', label: 'English', color: '#0F172A', bg: '#F1F5F9', icon: '📝',
    chapters: createChapters('English', null, [
      'Grammar',
      'Vocabulary',
      'Reading Comprehension',
      'Sentence Correction',
      'Synonyms and Antonyms',
      'Idioms and Phrases',
      'Para Jumbles',
      'Fill in the Blanks',
    ]),
  },
  {
    id: 'General Aptitude', label: 'General Aptitude', color: '#0F172A', bg: '#F1F5F9', icon: '🧠',
    chapters: createChapters('General Aptitude', null, [
      'Quantitative Aptitude',
      'Numerical Ability',
      'Logical Reasoning',
      'Analytical Reasoning',
      'Data Interpretation',
      'General Mental Ability',
    ]),
  },
];

const TOPIC_NAMES_BY_CHAPTER = {
  Physics: {
    'Units and Measurements': ['Physical quantities and units', 'Dimensional analysis', 'Measurement errors and significant figures'],
    'Motion in a Straight Line': ['Position, displacement and velocity', 'Uniformly accelerated motion', 'Motion graphs'],
    'Motion in a Plane': ['Vectors', 'Projectile motion', 'Uniform circular motion'],
    'Laws of Motion': ['Newton’s laws of motion', 'Friction', 'Circular motion and force'],
    'Work, Energy and Power': ['Work and kinetic energy', 'Potential energy and conservation of energy', 'Power and collisions'],
    'System of Particles and Rotational Motion': ['Centre of mass', 'Torque and angular momentum', 'Moment of inertia and rotational dynamics'],
    Gravitation: ['Universal law of gravitation', 'Gravitational field and potential', 'Satellites and escape velocity'],
    'Mechanical Properties of Solids': ['Stress and strain', 'Elastic moduli', 'Stress-strain relationships'],
    'Mechanical Properties of Fluids': ['Pressure and fluid statics', 'Fluid flow and continuity', 'Bernoulli’s principle and viscosity'],
    'Thermal Properties of Matter': ['Temperature and thermal expansion', 'Calorimetry and heat transfer', 'Change of state'],
    Thermodynamics: ['Thermal equilibrium and the zeroth law', 'First law of thermodynamics', 'Heat engines and the second law'],
    'Kinetic Theory': ['Kinetic model of gases', 'Pressure and molecular speeds', 'Degrees of freedom and specific heat'],
    Oscillations: ['Simple harmonic motion', 'Energy in oscillatory motion', 'Simple pendulum'],
    Waves: ['Wave motion and wave speed', 'Superposition and standing waves', 'Sound waves and beats'],
    'Electric Charges and Fields': ['Electric charge and Coulomb’s law', 'Electric field and field lines', 'Electric dipole and Gauss’s law'],
    'Electrostatic Potential and Capacitance': ['Electric potential and potential energy', 'Equipotential surfaces', 'Capacitance and dielectrics'],
    'Current Electricity': ['Electric current and drift velocity', 'Ohm’s law and resistance', 'Cells and Kirchhoff’s laws'],
    'Moving Charges and Magnetism': ['Magnetic force on charges and currents', 'Motion in a magnetic field', 'Biot–Savart law and Ampere’s law'],
    'Magnetism and Matter': ['Magnetic dipoles and field', 'Earth’s magnetism', 'Magnetic properties of materials'],
    'Electromagnetic Induction': ['Magnetic flux and Faraday’s law', 'Lenz’s law', 'Inductance and eddy currents'],
    'Alternating Current': ['AC voltage and current', 'Reactance and impedance', 'Resonance and transformers'],
    'Electromagnetic Waves': ['Displacement current', 'Electromagnetic wave properties', 'Electromagnetic spectrum'],
    'Ray Optics and Optical Instruments': ['Reflection and refraction', 'Mirrors and lenses', 'Optical instruments'],
    'Wave Optics': ['Huygens’ principle', 'Interference', 'Diffraction and polarisation'],
    'Dual Nature of Radiation and Matter': ['Photoelectric effect', 'Matter waves', 'Wave-particle duality'],
    Atoms: ['Rutherford model', 'Bohr model', 'Atomic spectra'],
    Nuclei: ['Nuclear composition and size', 'Mass defect and binding energy', 'Radioactivity and nuclear reactions'],
    'Semiconductor Electronics': ['Energy bands and semiconductors', 'p-n junction diode', 'Transistors and logic gates'],
  },
  Chemistry: {
    'Some Basic Concepts of Chemistry': ['Laws of chemical combination', 'Atomic and molecular masses', 'Mole concept and stoichiometry'],
    'Structure of Atom': ['Electromagnetic radiation and spectra', 'Bohr model', 'Quantum numbers and orbitals'],
    'Classification of Elements and Periodicity': ['Modern periodic table', 'Periodic trends in atomic properties', 'Periodic trends in chemical properties'],
    'Chemical Bonding and Molecular Structure': ['Ionic and covalent bonding', 'Lewis structures and bond parameters', 'VSEPR, hybridisation and molecular orbital theory'],
    'Chemical Thermodynamics': ['System, state and thermodynamic processes', 'First law and enthalpy', 'Entropy and Gibbs energy'],
    Equilibrium: ['Dynamic and chemical equilibrium', 'Equilibrium constants and Le Chatelier’s principle', 'Ionic equilibrium, pH and buffers'],
    'Redox Reactions': ['Oxidation numbers', 'Balancing redox reactions', 'Redox reactions and electrode processes'],
    'Organic Chemistry — Basic Principles and Techniques': ['Nomenclature and representation', 'Electronic effects and reaction intermediates', 'Organic reaction types and purification'],
    Hydrocarbons: ['Alkanes', 'Alkenes and alkynes', 'Aromatic hydrocarbons'],
    Solutions: ['Concentration terms and solubility', 'Vapour pressure and Raoult’s law', 'Colligative properties'],
    Electrochemistry: ['Electrochemical cells and cell potential', 'Nernst equation', 'Conductance and electrolysis'],
    'Chemical Kinetics': ['Rate of reaction and rate law', 'Order and molecularity', 'Integrated rate equations and activation energy'],
    'd- and f-Block Elements': ['Electronic configuration and trends', 'Properties of transition elements', 'Lanthanides and actinides'],
    'Coordination Compounds': ['Ligands and coordination nomenclature', 'Isomerism in coordination compounds', 'Bonding, colour and magnetic properties'],
    'Haloalkanes and Haloarenes': ['Nomenclature and structure', 'Nucleophilic substitution reactions', 'Preparation and reactions of haloarenes'],
    'Alcohols, Phenols and Ethers': ['Alcohols: preparation and reactions', 'Phenols: acidity and reactions', 'Ethers: preparation and reactions'],
    'Aldehydes, Ketones and Carboxylic Acids': ['Structure and preparation', 'Nucleophilic addition reactions', 'Carboxylic acid reactions'],
    Amines: ['Classification and nomenclature', 'Basicity and preparation', 'Reactions of amines and diazonium salts'],
    Biomolecules: ['Carbohydrates', 'Proteins and enzymes', 'Vitamins and nucleic acids'],
  },
  Mathematics: {
    Sets: ['Set representation and subsets', 'Operations on sets', 'Venn diagrams and complements'],
    'Relations and Functions': ['Relations and their properties', 'Functions and domain/range', 'Types and composition of functions'],
    'Trigonometric Functions': ['Angles and trigonometric functions', 'Trigonometric identities', 'Trigonometric equations and graphs'],
    'Complex Numbers and Quadratic Equations': ['Complex numbers and algebra', 'Argand plane and modulus', 'Quadratic equations and roots'],
    'Linear Inequalities': ['Linear inequalities in one variable', 'Linear inequalities in two variables', 'Graphical solution of systems'],
    'Permutations and Combinations': ['Fundamental counting principle', 'Permutations', 'Combinations'],
    'Binomial Theorem': ['Binomial expansion for positive integral index', 'General and middle terms', 'Binomial coefficients and applications'],
    'Sequence and Series': ['Arithmetic progressions', 'Geometric progressions', 'Special series and sums'],
    'Straight Lines': ['Slope and angle between lines', 'Forms of the equation of a line', 'Distance and family of lines'],
    'Conic Sections': ['Circle', 'Parabola', 'Ellipse and hyperbola'],
    'Introduction to Three-Dimensional Geometry': ['Coordinates in three dimensions', 'Distance formula', 'Section formula'],
    'Limits and Derivatives': ['Limits and continuity basics', 'Derivative from first principles', 'Algebra of derivatives'],
    Statistics: ['Measures of dispersion', 'Mean deviation', 'Variance and standard deviation'],
    Probability: ['Random experiments and events', 'Addition and multiplication rules', 'Conditional probability and Bayes’ theorem'],
    'Inverse Trigonometric Functions': ['Principal value branches', 'Domains and ranges', 'Identities and equations'],
    Matrices: ['Types and equality of matrices', 'Matrix operations', 'Transpose and inverse of a matrix'],
    Determinants: ['Evaluation and properties', 'Minors and cofactors', 'Applications to systems of linear equations'],
    'Continuity and Differentiability': ['Continuity of functions', 'Differentiability and derivatives', 'Chain rule and derivatives of inverse functions'],
    'Applications of Derivatives': ['Rate of change', 'Increasing and decreasing functions', 'Tangents, normals and optimisation'],
    Integrals: ['Indefinite integrals and standard forms', 'Methods of integration', 'Definite integrals and properties'],
    'Applications of Integrals': ['Area under a curve', 'Area between curves', 'Area using definite integrals'],
    'Differential Equations': ['Order, degree and formation', 'General and particular solutions', 'First-order differential equations'],
    'Vector Algebra': ['Vectors and components', 'Scalar and vector products', 'Applications of vector products'],
    'Three-Dimensional Geometry': ['Direction ratios and direction cosines', 'Equations of a line in space', 'Angles and distances in three dimensions'],
    'Linear Programming': ['Linear programming terminology', 'Formulation of constraints', 'Graphical method and optimal solutions'],
  },
  English: {
    Grammar: ['Parts of speech', 'Tenses and verb forms', 'Subject–verb agreement', 'Articles and determiners', 'Prepositions and conjunctions'],
    Vocabulary: ['Word meanings in context', 'Word formation and roots', 'Commonly confused words'],
    'Reading Comprehension': ['Main idea and purpose', 'Inference and implications', 'Tone and vocabulary in context'],
    'Sentence Correction': ['Grammar and usage errors', 'Sentence structure and clauses', 'Parallelism and modifiers'],
    'Synonyms and Antonyms': ['Synonyms in context', 'Antonyms in context', 'Nuance and degree of meaning'],
    'Idioms and Phrases': ['Common idiomatic expressions', 'Phrasal verbs', 'Meaning and usage in context'],
    'Para Jumbles': ['Sentence sequencing', 'Opening and concluding sentences', 'Cohesion and transition clues'],
    'Fill in the Blanks': ['Single-word completion', 'Grammar-based completion', 'Contextual vocabulary and cloze passages'],
  },
  'General Aptitude': {
    'Quantitative Aptitude': ['Percentages, ratio and proportion', 'Profit, loss and interest', 'Time, work and distance', 'Averages and mixtures'],
    'Numerical Ability': ['Number systems and simplification', 'Fractions, decimals and operations', 'Sequences and missing numbers'],
    'Logical Reasoning': ['Series and patterns', 'Coding and decoding', 'Direction sense and ordering', 'Syllogisms'],
    'Analytical Reasoning': ['Arrangements and grouping', 'Conditional logic and constraints', 'Statement-based reasoning'],
    'Data Interpretation': ['Tables and charts', 'Graphs and comparisons', 'Ratios, percentages and data sufficiency'],
    'General Mental Ability': ['Classification and analogy', 'Spatial and visual reasoning', 'Basic logic puzzles'],
  },
};

const TOPIC_CURRICULUM = Object.fromEntries(
  Object.entries(TOPIC_NAMES_BY_CHAPTER).map(([subjectId, chapterTopics]) => {
    const subject = SUBJECTS.find(item => item.id === subjectId);
    return [subjectId, Object.fromEntries(subject.chapters.map(chapter => [
      chapter.id,
      (chapterTopics[chapter.name] || []).map((name, index) => ({
        id: `${chapter.id}-topic-${index + 1}`,
        name,
        order: index + 1,
        parentChapterId: chapter.id,
        parentChapterName: chapter.name,
      })),
    ]))];
  })
);

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── Subject Selection ────────────────────────────────────────────────────────
function SubjectSelect({ onSelect, mobileOpen, setMobileOpen }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', overflow: 'hidden' }}>
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Mobile topbar */}
        <div style={{
          display: 'none',
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#0F172A', fontSize: 22
          }}>☰</button>
        </div>

        {/* Standard Page Topbar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Sectional Tests
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: 36, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 28, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: 8 }}>Choose a Subject</div>
            <div style={{ fontSize: 14, color: '#64748B' }}>Select a subject to practice chapter-wise questions</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {SUBJECTS.map(sub => (
              <div key={sub.id} onClick={() => onSelect(sub)}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: '28px 20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#0F172A'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26 }}>
                  {sub.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 6 }}>{sub.label}</div>
                <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 600, background: '#F1F5F9', padding: '3px 12px', borderRadius: 999, display: 'inline-block' }}>
                  Select →
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Chapter Selection ────────────────────────────────────────────────────────
function ChapterSelect({ subject, onSelect, onBack, mobileOpen, setMobileOpen }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function fetchChapters() {
      const { data, error: queryError } = await supabase
        .from('questions')
        .select('chapter')
        .eq('subject', subject.id);

      if (!active) return;
      if (queryError) {
        console.error('Unable to load chapter question counts.', queryError);
        setError(queryError.message || 'Unable to load question counts. Please try again.');
        setLoading(false);
        return;
      }

      const counts = new Map();
      (data || []).forEach(question => {
        if (question.chapter) counts.set(question.chapter, (counts.get(question.chapter) || 0) + 1);
      });
      setChapters(subject.chapters.map(chapter => ({
        ...chapter,
        count: counts.get(chapter.name) || 0,
      })).sort((a, b) => a.order - b.order));
      setLoading(false);
    }
    fetchChapters().catch(queryError => {
      console.error('Unable to load chapter question counts.', queryError);
      if (active) {
        setError(queryError.message || 'Unable to load question counts. Please try again.');
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [subject]);

  const chapterGroups = chapters.reduce((groups, chapter) => {
    const key = chapter.classLevel || '';
    if (!groups[key]) groups[key] = [];
    groups[key].push(chapter);
    return groups;
  }, {});

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', overflow: 'hidden' }}>
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Mobile topbar */}
        <div style={{
          display: 'none',
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#0F172A', fontSize: 22
          }}>☰</button>
        </div>

        {/* Standard Page Topbar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <button onClick={onBack} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569', fontFamily: 'inherit' }}>
            ← Back to Subjects
          </button>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{subject.label}</div>
          <div style={{ width: 80 }} />
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {subject.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#0F172A' }}>{subject.label}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Select a chapter to begin</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading chapters...</div>
          ) : error ? (
            <div role="alert" style={{ textAlign: 'center', color: '#0F172A', padding: 40 }}>{error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(chapterGroups).map(([classLevel, groupChapters]) => (
                <section key={classLevel || 'sections'}>
                  {classLevel && <h3 style={{ margin: '0 0 10px', color: '#64748B', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Class {classLevel}</h3>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {groupChapters.map((ch, i) => (
                      <div key={ch.id} onClick={() => { if (ch.count > 0) onSelect(ch); }}
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', cursor: ch.count > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s', opacity: ch.count > 0 ? 1 : 0.75 }}
                        onMouseEnter={e => { if (ch.count > 0) { e.currentTarget.style.borderColor = '#0F172A'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#0F172A', flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{ch.name}</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{ch.count > 0 ? `${ch.count} questions` : 'No questions yet'}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: ch.count > 0 ? '#0F172A' : '#64748B' }}>
                          {ch.count > 0 ? 'Start →' : 'Coming soon'}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Topic Selection ──────────────────────────────────────────────────────────
function TopicSelect({ subject, chapter, onSelect, onBack, mobileOpen, setMobileOpen }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const curriculumTopics = TOPIC_CURRICULUM[subject.id]?.[chapter.id] || [];

  useEffect(() => {
    let active = true;
    async function fetchTopics() {
      const { data, error: queryError } = await supabase
        .from('questions')
        .select('topic')
        .eq('subject', subject.id)
        .eq('chapter', chapter.name);

      if (!active) return;
      if (queryError) {
        console.error('Unable to load topic question counts.', queryError);
        setError(queryError.message || 'Unable to load topic counts. Please try again.');
        setLoading(false);
        return;
      }

      const counts = new Map();
      (data || []).forEach(question => {
        if (question.topic) counts.set(question.topic, (counts.get(question.topic) || 0) + 1);
      });
      setTopics(curriculumTopics.map(topic => ({
        ...topic,
        count: counts.get(topic.name) || 0,
      })).sort((a, b) => a.order - b.order));
      setLoading(false);
    }
    fetchTopics().catch(queryError => {
      console.error('Unable to load topic question counts.', queryError);
      if (active) {
        setError(queryError.message || 'Unable to load topic counts. Please try again.');
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [chapter.name, curriculumTopics, subject.id]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', overflow: 'hidden' }}>
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* Mobile topbar */}
        <div style={{
          display: 'none',
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#0F172A', fontSize: 22
          }}>☰</button>
        </div>

        {/* Standard Page Topbar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
          <button onClick={onBack} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569', fontFamily: 'inherit' }}>
            ← Back to Chapters
          </button>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{subject.label} · {chapter.name}</div>
          <div style={{ width: 80 }} />
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {subject.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#0F172A' }}>{chapter.name}</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Choose a topic · IMUPilot-organized categories, not an official IMU topic list</div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading topics...</div>
          ) : error ? (
            <div role="alert" style={{ textAlign: 'center', color: '#0F172A', padding: 40 }}>{error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topics.map((topic, index) => (
                <div key={topic.id} onClick={() => { if (topic.count > 0) onSelect(topic); }}
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', cursor: topic.count > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s', opacity: topic.count > 0 ? 1 : 0.75 }}
                  onMouseEnter={e => { if (topic.count > 0) { e.currentTarget.style.borderColor = '#0F172A'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#0F172A', flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{topic.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{topic.count > 0 ? `${topic.count} questions` : 'No questions yet'}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: topic.count > 0 ? '#0F172A' : '#64748B' }}>
                    {topic.count > 0 ? 'Start →' : 'Coming soon'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Test Engine ──────────────────────────────────────────────────────────────
function TestEngine({ subject, chapter, topic, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(45 * 60);
  const [startTime] = useState(Date.now());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const [attemptToken, setAttemptToken] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const authData = await supabase.auth.getSession();
        const token = authData.data.session?.access_token;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const res = await fetch(`${apiUrl}/api/tests/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify({
            testType: 'sectional',
            filters: { subject: subject.id, chapter: chapter.name, topic: topic?.name }
          })
        });
        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions || []);
          setAttemptToken(data.attemptToken);
          setTimeRemaining((data.questions?.length || 50) * 54); // ~54 sec per question
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [subject.id, chapter.name, topic?.name]);

  useEffect(() => {
    if (loading || submitted) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted]);

  const currentQ = questions[currentIndex];

  const handleAnswer = (optKey) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optKey }));
  };

  const handleClear = () => {
    setAnswers(prev => { const p = { ...prev }; delete p[currentIndex]; return p; });
  };

  const handleSubmit = useCallback(async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    try {
      const authData = await supabase.auth.getSession();
      const token = authData.data.session?.access_token;
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const answersById = {};
      questions.forEach((q, i) => {
        if (answers[i]) answersById[q.id] = answers[i];
      });

      const res = await fetch(`${apiUrl}/api/tests/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          attemptToken,
          answers: answersById,
          timeTaken
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const { correct, incorrect, skipped, questions: realQuestions } = data;
        const score = correct - incorrect * 0.25;
        const attempted = correct + incorrect;
        
        const finalQuestions = questions.map(q => {
          const fullQ = realQuestions.find(rq => rq.id === q.id);
          return fullQ || q;
        });

        setResult({
          correct, incorrect, skipped,
          score: Math.round(score * 100) / 100,
          total: finalQuestions.length,
          accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
          timeTaken,
          questions: finalQuestions,
          answers,
        });
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitted(true);
  }, [answers, questions, startTime, attemptToken]);

  // ── Result Screen ──
  if (submitted && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', color: 'var(--accent-navy, #0F172A)' }}>
              <LogoIcon />
            </span>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent-navy, #0F172A)' }}>IMUPilot</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{subject.label} — {chapter.name}</div>
          <button onClick={onBack} style={{ background: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            Back to Subjects
          </button>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Score', value: result.score, color: '#0F172A', big: true },
              { label: 'Correct', value: result.correct, color: '#0F172A' },
              { label: 'Incorrect', value: result.incorrect, color: '#0F172A' },
              { label: 'Skipped', value: result.skipped, color: '#0F172A' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: s.big ? 32 : 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                {s.big && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>/ {result.total}</div>}
              </div>
            ))}
          </div>

          {/* Accuracy + time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎯</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Accuracy</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{result.accuracy}%</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⏱️</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time Taken</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{formatTime(result.timeTaken)}</div>
              </div>
            </div>
          </div>

          {/* Question review */}
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Question Review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.questions.map((q, i) => {
              const selected = result.answers[i];
              const selectedLetter = selected ? selected.replace('option_', '') : null;
              const isCorrect = selectedLetter === q.correct_option;
              const isSkipped = !selected;
              return (
                <div key={i} style={{ background: 'var(--bg-elevated)', border: `1px solid ${isCorrect ? '#0F172A' : isSkipped ? '#E2E8F0' : '#475569'}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)' }}>Q{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#F1F5F9', color: isCorrect ? '#0F172A' : isSkipped ? '#64748B' : '#475569' }}>
                      {isCorrect ? '✓ Correct' : isSkipped ? '— Skipped' : '✗ Incorrect'}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.6 }}>
                      <MathText text={q.question_text} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['option_a','option_b','option_c','option_d'].map((opt, oi) => {
                        const letter = opt.replace('option_', '');
                        const isCorrectOpt = letter === q.correct_option;
                        const isSelectedOpt = letter === selectedLetter;
                        const isWrong = isSelectedOpt && !isCorrectOpt;
                        return (
                          <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: isCorrectOpt ? '#F1F5F9' : isWrong ? '#F1F5F9' : 'var(--bg-tertiary)', border: `1px solid ${isCorrectOpt ? '#0F172A' : isWrong ? '#475569' : 'var(--border-subtle)'}` }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: isCorrectOpt ? '#0F172A' : isWrong ? '#475569' : 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isCorrectOpt || isWrong ? '#fff' : 'var(--text-secondary)', flexShrink: 0 }}>
                              {letter.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 12, color: isCorrectOpt ? '#0F172A' : isWrong ? '#475569' : 'var(--text-primary)' }}>
                              <MathText text={q[opt]} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {q.concept && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: '#F1F5F9', borderRadius: 8, fontSize: 12, color: '#0F172A' }}>
                        💡 <b>Concept:</b> {q.concept}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Submit Confirm ──
  if (showSubmitConfirm) {
    const answered = Object.keys(answers).length;
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans','Segoe UI',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 20, padding: 36, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Submit Test?</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            Answered <b style={{ color: '#0F172A' }}>{answered}</b> of <b>{questions.length}</b> questions.
            <br />{questions.length - answered} questions unanswered.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--bg-elevated)', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', color: 'var(--text-secondary)' }}>
              Go Back
            </button>
            <button onClick={handleSubmit} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 10, background: '#0F172A', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: 'var(--text-secondary)' }}>
      Loading questions...
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Segoe UI',sans-serif", gap: 12 }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>No questions yet</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Questions for this chapter are coming soon.</div>
      <button onClick={onBack} style={{ marginTop: 12, background: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
        Back
      </button>
    </div>
  );

  const answered = Object.keys(answers).length;

  // ── Main Test UI ──
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', color: 'var(--accent-navy, #0F172A)' }}>
            <LogoIcon />
          </span>
          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent-navy)' }}>IMUPilot</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Timer */}
          <div style={{ background: '#0F172A', color: '#fff', fontWeight: 800, fontSize: 18, padding: '6px 18px', borderRadius: 10, letterSpacing: 1, fontFamily: 'monospace' }}>
            {formatTime(timeRemaining)}
          </div>
          {/* Submit */}
          <button onClick={() => setShowSubmitConfirm(true)} style={{ background: '#0F172A', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Submit Exam
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* Question card */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

            {/* Question header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: subject.color, color: '#fff', fontWeight: 700, fontSize: 11, padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {subject.label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Question {currentIndex + 1} of {questions.length}</span>
              </div>
            </div>

            {/* Question text */}
            <div style={{ padding: '24px 24px 16px' }}>
              <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 24, fontWeight: 500 }}>
                <MathText text={currentQ?.question_text || ''} />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['option_a','option_b','option_c','option_d'].map((opt, i) => {
                  const label = ['A','B','C','D'][i];
                  const isSelected = answers[currentIndex] === opt;
                  return (
                    <div key={opt} onClick={() => handleAnswer(opt)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `2px solid ${isSelected ? subject.color : 'var(--border-subtle)'}`, background: isSelected ? subject.bg : 'var(--bg-tertiary)', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; } }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${isSelected ? subject.color : 'var(--border-subtle)'}`, background: isSelected ? subject.color : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: isSelected ? '#fff' : 'var(--text-secondary)', flexShrink: 0, transition: 'all 0.15s' }}>
                        {label}
                      </div>
                      <span style={{ fontSize: 14, color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                        <MathText text={currentQ?.[opt] || ''} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom nav */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => { if (currentIndex > 0) setCurrentIndex(i => i - 1); }}
                disabled={currentIndex === 0}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--bg-elevated)', cursor: currentIndex === 0 ? 'default' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                ← Previous
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={handleClear}
                  style={{ padding: '9px 16px', border: '1px solid #E2E8F0', borderRadius: 10, background: '#F1F5F9', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit' }}>
                  ✕ Clear
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{answered} answered · {questions.length - answered} remaining</span>
              </div>

              <button onClick={() => { if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1); else setShowSubmitConfirm(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: 'none', borderRadius: 10, background: 'var(--accent-navy)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
                {currentIndex < questions.length - 1 ? 'Next →' : 'Submit →'}
              </button>
            </div>
          </div>
        </div>

        {/* Right palette */}
        <div style={{ width: 220, background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>Question Palette</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Answered: {answered} / {questions.length}</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {questions.map((_, i) => {
                const isAnswered = !!answers[i];
                const isCurrent = currentIndex === i;
                return (
                  <div key={i} onClick={() => setCurrentIndex(i)}
                    style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      background: (isCurrent || isAnswered) ? '#0F172A' : 'var(--bg-tertiary)',
                      color: (isCurrent || isAnswered) ? '#FFFFFF' : 'var(--text-secondary)',
                      border: (isCurrent || isAnswered) ? '2px solid #0F172A' : '2px solid var(--border-subtle)',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(15, 23, 42, 0.2)' : 'none',
                    }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-secondary)' }}>
            {[
              { color: '#0F172A', border: '#0F172A', label: 'Current' },
              { color: '#0F172A', border: '#0F172A', label: 'Answered' },
              { color: 'var(--bg-tertiary)', border: 'var(--border-subtle)', label: 'Not answered' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1px solid ${l.border || l.color}`, flexShrink: 0 }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SectionalTestEngine() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState('subjects'); // subjects | chapters | topics | test
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  if (view === 'subjects') return (
    <SubjectSelect
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      onSelect={sub => { setSelectedSubject(sub); setView('chapters'); }}
    />
  );

  if (view === 'chapters') return (
    <ChapterSelect
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      subject={selectedSubject}
      onSelect={ch => {
        setSelectedChapter(ch);
        setSelectedTopic(null);
        setView(TOPIC_CURRICULUM[selectedSubject.id] ? 'topics' : 'test');
      }}
      onBack={() => setView('subjects')}
    />
  );

  if (view === 'topics') return (
    <TopicSelect
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      subject={selectedSubject}
      chapter={selectedChapter}
      onSelect={topic => { setSelectedTopic(topic); setView('test'); }}
      onBack={() => setView('chapters')}
    />
  );

  return (
    <TestEngine
      subject={selectedSubject}
      chapter={selectedChapter}
      topic={selectedTopic}
      onBack={() => {
        if (selectedTopic) {
          setSelectedTopic(null);
          setView('topics');
        } else {
          setView('subjects');
          setSelectedSubject(null);
          setSelectedChapter(null);
        }
      }}
    />
  );
}
