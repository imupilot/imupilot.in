import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IMUpilotSidebar from '../components/IMUpilotSidebar';
import UpgradeModal from '../components/UpgradeModal';
import { supabase } from '../supabaseClient';

// ─── SYLLABUS DATA (IMUCET OFFICIAL BLUEPRINT) ───────────────────────────────
const SYLLABUS = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    weightage: '50 Questions (50 Marks)',
    shortLabel: '50Q',
    description: 'Calculus, Vectors, Algebra, Coordinate Geometry, Matrices & Probability',
    topics: [
      {
        id: 'math-1',
        title: 'Quadratic Equations',
        subtopics: [
          'Nature of Roots & Discriminant Analysis',
          'Relation between Roots and Coefficients',
          'Formation of Quadratic Equations & Symmetric Functions',
          'Sign of Quadratic Expressions & Maximum/Minimum Values',
          'Location of Roots and Common Root Conditions',
        ],
      },
      {
        id: 'math-2',
        title: 'Sets, Relations & Functions',
        subtopics: [
          'Types of Sets, Subsets & Venn Diagram Operations',
          'Cartesian Product, Relations & Equivalence Relations',
          'Types of Functions: One-One (Injective), Onto (Surjective) & Bijective',
          'Domain, Codomain, and Range Determination',
          'Composite Functions & Inverse of a Function',
        ],
      },
      {
        id: 'math-3',
        title: 'Trigonometry & Inverse Trigonometric Functions',
        subtopics: [
          'Trigonometric Ratios, Compound Angles & Multiple/Submultiple Formulas',
          'General & Principal Solutions of Trigonometric Equations',
          'Properties and Graphs of Inverse Trigonometric Functions',
          'Addition & Subtraction Theorems for ITF',
          'Heights and Distances & Triangle Solutions',
        ],
      },
      {
        id: 'math-4',
        title: 'Complex Numbers',
        subtopics: [
          'Algebraic Operations, Conjugate & Modulus-Argument Form',
          'Argand Plane Representation & Polar Coordinates',
          'Euler’s Formula & De Moivre’s Theorem',
          'Cube Roots of Unity & nth Roots of Unity',
          'Geometry of Complex Numbers & Locus Problems',
        ],
      },
      {
        id: 'math-5',
        title: 'Permutation & Combination',
        subtopics: [
          'Fundamental Principles of Addition and Multiplication',
          'Linear and Circular Permutations with Repeated Objects',
          'Combinations, Selections & Restricted Combinations',
          'Division into Groups and Distribution to Persons',
          'Derangements & Geometry-based Selection Problems',
        ],
      },
      {
        id: 'math-6',
        title: 'Binomial Theorem',
        subtopics: [
          'Binomial Expansion for Positive Integral Index',
          'General Term, Middle Term & Numerically Greatest Term',
          'Properties and Summations of Binomial Coefficients',
          'Binomial Theorem for Any Rational Index',
          'Approximations and Series Expansions',
        ],
      },
      {
        id: 'math-7',
        title: 'Matrices & Determinants',
        subtopics: [
          'Types of Matrices, Operations & Transpose Properties',
          'Symmetric, Skew-Symmetric & Orthogonal Matrices',
          'Properties of Determinants & Minors/Cofactors',
          'Adjoint and Inverse of Square Matrices',
          'System of Linear Equations: Cramer’s Rule & Matrix Inversion',
        ],
      },
      {
        id: 'math-8',
        title: 'Straight Lines & Circles',
        subtopics: [
          'Slope, Various Forms of Line Equations & Angle between Lines',
          'Distance Formulas: Point to Line & Parallel Lines',
          'Standard and General Equations of a Circle',
          'Equation of Tangents, Normals and Chord with Given Midpoint',
          'Family of Circles & Radical Axis Concepts',
        ],
      },
      {
        id: 'math-9',
        title: 'Conic Sections',
        subtopics: [
          'Parabola: Standard Equations, Focus, Directrix & Latus Rectum',
          'Ellipse: Standard Equations, Eccentricity & Focal Properties',
          'Hyperbola: Equations, Asymptotes & Rectangular Hyperbola',
          'Tangents, Normals & Director Circles of Conics',
          'Condition of Tangency for Conic Curves',
        ],
      },
      {
        id: 'math-10',
        title: 'Limits & Derivatives',
        subtopics: [
          'Evaluation of Limits: Factorization, Rationalization & Standard Limits',
          'L’Hôpital’s Rule & Indeterminate Forms (0/0, ∞/∞)',
          'Continuity at a Point and in an Interval',
          'Differentiability, Chain Rule & Implicit Differentiation',
          'Higher Order Derivatives & Parametric Differentiation',
        ],
      },
      {
        id: 'math-11',
        title: 'Integration',
        subtopics: [
          'Indefinite Integrals: Standard Formulas & Substitution Method',
          'Integration by Parts & Partial Fractions',
          'Definite Integrals: Fundamental Theorem & Core Properties',
          'Even/Odd & Periodic Integrals Properties',
          'Area Bounded by Standard Curves & Straight Lines',
        ],
      },
      {
        id: 'math-12',
        title: 'Differential Equations',
        subtopics: [
          'Order and Degree of Differential Equations',
          'Formation of Differential Equations by Eliminating Constants',
          'Variable Separable Method & Reducible Forms',
          'Homogeneous Differential Equations',
          'First Order Linear Differential Equations (Integrating Factor)',
        ],
      },
      {
        id: 'math-13',
        title: 'Sequence & Series',
        subtopics: [
          'Arithmetic Progression (AP): General Term, Sum of n Terms & Properties',
          'Geometric Progression (GP): General Term, Finite & Infinite Sums',
          'Harmonic Progression (HP) & Relation between AM, GM and HM',
          'Arithmetic-Geometric Progression (AGP)',
          'Sum of Special Series: Σn, Σn², Σn³ & Method of Differences',
        ],
      },
      {
        id: 'math-14',
        title: 'Vector Algebra',
        subtopics: [
          'Types of Vectors, Position Vectors & Direction Cosines/Ratios',
          'Scalar (Dot) Product: Projection & Geometric Interpretation',
          'Vector (Cross) Product: Properties, Area of Triangle & Parallelogram',
          'Scalar Triple Product (Box Product) & Coplanarity Condition',
          'Vector Triple Product & Applications',
        ],
      },
      {
        id: 'math-15',
        title: '3D Geometry',
        subtopics: [
          'Direction Cosines & Direction Ratios of Lines in Space',
          'Equation of a Straight Line in Vector and Cartesian Forms',
          'Angle between Two Lines & Shortest Distance between Skew Lines',
          'Equation of a Plane: Normal Form, Intercept Form & Three Points',
          'Intersection of Line and Plane, Coplanarity of Lines',
        ],
      },
      {
        id: 'math-16',
        title: 'Statistics & Probability',
        subtopics: [
          'Measures of Dispersion: Range, Mean Deviation & Standard Deviation',
          'Variance and Coefficient of Variation',
          'Classical, Empirical & Axiomatic Definitions of Probability',
          'Conditional Probability, Multiplication Rule & Independent Events',
          'Bayes’ Theorem, Random Variables & Binomial Distribution',
        ],
      },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    weightage: '50 Questions (50 Marks)',
    shortLabel: '50Q',
    description: 'Mechanics, Electricity, Magnetism, Optics, Thermodynamics & Modern Physics',
    topics: [
      {
        id: 'phys-1',
        title: 'Units & Measurements',
        subtopics: [
          'SI Base and Derived Units, Dimensions of Physical Quantities',
          'Dimensional Analysis: Principle of Homogeneity & Conversion of Units',
          'Errors in Measurement: Systematic, Random, Absolute & Relative Errors',
          'Combination and Propagation of Errors in Calculations',
          'Least Count Principles: Vernier Calipers and Screw Gauge',
        ],
      },
      {
        id: 'phys-2',
        title: 'Kinematics',
        subtopics: [
          'Motion in a Straight Line: Distance, Displacement, Velocity & Acceleration',
          'Kinematic Graphs (s-t, v-t, a-t) and Area Interpretations',
          'Equations of Uniformly Accelerated Motion (Scalar & Vector Forms)',
          'Motion in a Plane: Projectile Motion on Horizontal & Inclined Planes',
          'Relative Motion in One and Two Dimensions (Rain-Man & River-Boat)',
        ],
      },
      {
        id: 'phys-3',
        title: 'Laws of Motion',
        subtopics: [
          'Newton’s First, Second and Third Laws & Free Body Diagrams (FBD)',
          'Linear Momentum and Impulse-Momentum Theorem',
          'Conservation of Linear Momentum in Explosions and Collisions',
          'Static, Limiting and Kinetic Friction & Laws of Friction',
          'Dynamics of Circular Motion: Centripetal Force & Banking of Roads',
        ],
      },
      {
        id: 'phys-4',
        title: 'Work, Energy & Power',
        subtopics: [
          'Work Done by Constant and Variable Forces',
          'Work-Energy Theorem for a Particle and System of Particles',
          'Conservative vs Non-Conservative Forces & Potential Energy',
          'Conservation of Mechanical Energy & Spring-Mass Systems',
          'Collisions in 1D & 2D: Elastic, Inelastic & Coefficient of Restitution',
        ],
      },
      {
        id: 'phys-5',
        title: 'Rotational Motion',
        subtopics: [
          'Centre of Mass of Discrete and Continuous Systems',
          'Rotational Kinematics: Angular Velocity, Acceleration & Relations',
          'Torque, Couple and Angular Momentum Conservation',
          'Moment of Inertia: Parallel & Perpendicular Axes Theorems',
          'Pure Rolling Motion on Horizontal and Inclined Surfaces',
        ],
      },
      {
        id: 'phys-6',
        title: 'Gravitation',
        subtopics: [
          'Kepler’s Three Laws of Planetary Motion',
          'Newton’s Universal Law of Gravitation & Principle of Superposition',
          'Acceleration Due to Gravity (g) with Altitude, Depth & Rotation',
          'Gravitational Field Strength & Gravitational Potential Energy',
          'Escape Velocity, Orbital Velocity & Geostationary Satellites',
        ],
      },
      {
        id: 'phys-7',
        title: 'Properties of Matter',
        subtopics: [
          'Elasticity: Stress-Strain Curve, Hooke’s Law & Elastic Moduli',
          'Hydrostatic Pressure: Pascal’s Law & Hydraulic Lift Principle',
          'Archimedes’ Principle, Buoyancy & Floatation Stability in Ships',
          'Viscosity, Poiseuille’s Formula, Stokes’ Law & Terminal Velocity',
          'Surface Tension, Angle of Contact, Capillary Rise & Excess Pressure',
        ],
      },
      {
        id: 'phys-8',
        title: 'Thermodynamics',
        subtopics: [
          'Thermal Equilibrium, Temperature & Zeroth Law of Thermodynamics',
          'First Law of Thermodynamics: Internal Energy, Heat & Work Done',
          'Thermodynamic Processes: Isothermal, Adiabatic, Isobaric & Isochoric',
          'Specific Heat Capacities of Gases (Cp, Cv) & Mayer’s Relation',
          'Second Law of Thermodynamics, Heat Engines, Carnot Cycle & Refrigerator',
        ],
      },
      {
        id: 'phys-9',
        title: 'Kinetic Theory of Gases',
        subtopics: [
          'Postulates of Kinetic Molecular Theory of Ideal Gases',
          'Derivation of Gas Pressure & RMS Velocity of Molecules',
          'Kinetic Interpretation of Temperature & Average Kinetic Energy',
          'Degrees of Freedom & Law of Equipartition of Energy',
          'Mean Free Path & Maxwell-Boltzmann Speed Distribution',
        ],
      },
      {
        id: 'phys-10',
        title: 'Electrostatics',
        subtopics: [
          'Coulomb’s Law in Vector Form & Principle of Superposition',
          'Electric Field Lines, Field Intensity & Electric Dipole in Uniform Field',
          'Gauss’s Law and Applications: Wire, Sheet and Spherical Shells',
          'Electric Potential, Potential Energy of Point Charges and Dipoles',
          'Capacitance: Parallel Plate Capacitor, Dielectric Insertion & Energy',
        ],
      },
      {
        id: 'phys-11',
        title: 'Current Electricity',
        subtopics: [
          'Electric Current, Drift Velocity, Mobility & Ohm’s Law',
          'Resistivity, Temperature Coefficient of Resistance & Color Coding',
          'Series and Parallel Combination of Resistors & Cells',
          'Kirchhoff’s Current Law (KCL) & Kirchhoff’s Voltage Law (KVL)',
          'Wheatstone Bridge, Meter Bridge & Potentiometer Principles',
        ],
      },
      {
        id: 'phys-12',
        title: 'Magnetism & Magnetic Effects of Current',
        subtopics: [
          'Biot-Savart Law & Magnetic Field of Circular Loop and Solenoid',
          'Ampere’s Circuital Law and Magnetic Field Calculations',
          'Lorentz Force: Motion of Charged Particle in E and B Fields',
          'Force between Two Parallel Current-Carrying Conductors',
          'Magnetic Dipole Moment, Earth’s Magnetic Elements & Dia/Para/Ferro',
        ],
      },
      {
        id: 'phys-13',
        title: 'Electromagnetic Induction & Alternating Current',
        subtopics: [
          'Magnetic Flux, Faraday’s Laws of Induction & Lenz’s Law',
          'Motional EMF & Eddy Currents in Conductors',
          'Self-Inductance, Mutual Inductance & Energy Stored in Inductor',
          'Peak and RMS Values of AC Voltage and Current',
          'Series LCR Circuit: Impedance, Phasor Diagrams, Resonance & Power Factor',
        ],
      },
      {
        id: 'phys-14',
        title: 'Optics',
        subtopics: [
          'Reflection at Spherical Mirrors: Mirror Equation and Magnification',
          'Refraction at Plane Surfaces, Critical Angle & Total Internal Reflection',
          'Refraction through Prisms, Dispersion and Deviation Formulas',
          'Thin Lens Formula, Lens Maker’s Formula & Combination of Lenses',
          'Wave Optics: Huygens’ Principle, Interference (YDSE), Diffraction & Polarization',
        ],
      },
      {
        id: 'phys-15',
        title: 'Modern Physics',
        subtopics: [
          'Dual Nature of Radiation, Photoelectric Effect & Einstein’s Equation',
          'de Broglie Wavelength of Matter Waves & Davisson-Germer Experiment',
          'Bohr’s Model of Hydrogen Atom: Radii, Energy Levels & Spectral Lines',
          'Nuclear Composition, Mass Defect, Binding Energy & Radioactivity',
          'Semiconductor Devices: P-N Junction Diode, Rectifiers & Logic Gates',
        ],
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    weightage: '20 Questions (20 Marks)',
    shortLabel: '20Q',
    description: 'Physical, Inorganic and Organic Chemistry High-Yield Concepts',
    topics: [
      {
        id: 'chem-1',
        title: 'Basic Concepts of Chemistry',
        subtopics: [
          'Mole Concept, Molar Mass and Avogadro Number',
          'Stoichiometric Calculations, Limiting Reagents & Percentage Yield',
          'Percentage Composition, Empirical and Molecular Formulas',
          'Concentration Terms: Molarity, Molality, Normality & Mole Fraction',
          'Equivalent Weight and Law of Chemical Equivalence',
        ],
      },
      {
        id: 'chem-2',
        title: 'Atomic Structure',
        subtopics: [
          'Bohr’s Atomic Model, Radii of Orbits, Energy Calculations',
          'Hydrogen Emission Spectrum (Lyman, Balmer, Paschen Series)',
          'de Broglie Relation & Heisenberg’s Uncertainty Principle',
          'Quantum Numbers (n, l, m, s) and Shapes of Orbitals (s, p, d)',
          'Rules for Electronic Configuration: Aufbau, Pauli & Hund’s Rule',
        ],
      },
      {
        id: 'chem-3',
        title: 'Periodic Table & Periodic Properties',
        subtopics: [
          'Modern Periodic Law and Classification into s, p, d, f Blocks',
          'Periodic Trends: Atomic & Ionic Radii across Periods and Groups',
          'Ionization Enthalpy & Factors Affecting Ionization Energy',
          'Electron Gain Enthalpy & Electronegativity (Pauling Scale)',
          'Valency, Oxidation States & Anomalous Periodic Trends',
        ],
      },
      {
        id: 'chem-4',
        title: 'Chemical Bonding & Molecular Structure',
        subtopics: [
          'Ionic vs Covalent Bonds, Lattice Energy & Fajan’s Rules',
          'Lewis Dot Structures, Formal Charge & Resonance Structures',
          'VSEPR Theory: Prediction of Molecular Shapes and Geometries',
          'Valence Bond Theory & Hybridization (sp, sp2, sp3, sp3d, sp3d2)',
          'Molecular Orbital Theory (MOT): Bond Order and Magnetic Nature',
        ],
      },
      {
        id: 'chem-5',
        title: 'States of Matter (Gaseous & Liquid)',
        subtopics: [
          'Gas Laws: Boyle’s, Charles’s, Gay-Lussac’s and Avogadro’s Laws',
          'Ideal Gas Equation & Dalton’s Law of Partial Pressures',
          'Graham’s Law of Diffusion and Effusion',
          'Real Gas Deviation, Van der Waals Equation & Compressibility Factor',
          'Liquid State Properties: Surface Tension and Viscosity',
        ],
      },
      {
        id: 'chem-6',
        title: 'Chemical Thermodynamics',
        subtopics: [
          'First Law of Thermodynamics: Internal Energy, Heat, Work & Enthalpy',
          'Enthalpy of Reaction, Formation, Combustion & Hess’s Law of Heat Summation',
          'Second Law of Thermodynamics: Entropy as a Measure of Randomness',
          'Gibbs Free Energy (ΔG) and Spontaneity Criteria',
          'Third Law of Thermodynamics and Residual Entropy',
        ],
      },
      {
        id: 'chem-7',
        title: 'Equilibrium & Redox Reactions',
        subtopics: [
          'Law of Mass Action, Equilibrium Constants (Kc, Kp) and Le Chatelier’s Principle',
          'Ionic Equilibrium: Acids, Bases (Bronsted, Lewis) & pH Calculations',
          'Buffer Solutions, Salt Hydrolysis and Solubility Product (Ksp)',
          'Concept of Oxidation and Reduction & Oxidation Number Determination',
          'Balancing Redox Equations: Ion-Electron & Oxidation Number Methods',
        ],
      },
      {
        id: 'chem-8',
        title: 'Electrochemistry',
        subtopics: [
          'Electrochemical Cells, Galvanic/Voltaic Cells and Cell Representation',
          'Standard Electrode Potential and Electrochemical Series',
          'Nernst Equation for Single Electrode and Overall Cell EMF',
          'Conductance in Electrolytic Solutions, Molar Conductivity',
          'Kohlrausch’s Law of Independent Migration & Faraday’s Laws of Electrolysis',
        ],
      },
      {
        id: 'chem-9',
        title: 'Chemical Kinetics',
        subtopics: [
          'Rate of Reaction, Rate Law, Order and Molecularity of Reactions',
          'Integrated Rate Equations for Zero and First Order Reactions',
          'Half-life of Reactions and Determination of Order',
          'Effect of Temperature: Arrhenius Equation and Activation Energy',
          'Collision Theory of Reaction Rates and Catalysis',
        ],
      },
      {
        id: 'chem-10',
        title: 'Organic Chemistry — Fundamentals & Hydrocarbons',
        subtopics: [
          'IUPAC Rules of Nomenclature for Functionalized Compounds',
          'Isomerism: Structural Isomerism & Stereoisomerism (Geometrical, Optical)',
          'Electronic Displacement: Inductive, Electromeric, Resonance & Hyperconjugation',
          'Types of Organic Reactions: Substitution, Addition, Elimination',
          'Alkanes, Alkenes, Alkynes: Synthesis, Markovnikov Addition & Ozone Cleavage',
        ],
      },
      {
        id: 'chem-11',
        title: 'Coordination Compounds',
        subtopics: [
          'Werner’s Theory, Coordination Entity, Central Atom & Ligands',
          'IUPAC Nomenclature of Coordination Complexes',
          'Isomerism in Coordination Compounds (Geometrical, Optical, Ionization)',
          'Valence Bond Theory: Hybridization and Magnetic Properties',
          'Crystal Field Theory (CFT): Crystal Field Splitting in Octahedral & Tetrahedral',
        ],
      },
      {
        id: 'chem-12',
        title: 'Biomolecules & Polymers',
        subtopics: [
          'Carbohydrates: Classification, Monosaccharides (Glucose, Fructose) & Glycosidic Link',
          'Proteins: Amino Acids, Peptide Bond, Primary to Quaternary Structures',
          'Nucleic Acids: DNA, RNA Structure, Nucleotides & Replication Basics',
          'Vitamins & Classification (Fat-Soluble vs Water-Soluble)',
          'Polymers: Addition vs Condensation Polymers (Bakelite, Nylon, Dacron)',
        ],
      },
    ],
  },
  {
    id: 'aptitude',
    name: 'General Aptitude',
    weightage: '40 Questions (40 Marks)',
    shortLabel: '40Q',
    description: 'Quantitative Aptitude, Logical Reasoning, Spatial Patterns & Nautical Math',
    topics: [
      {
        id: 'apt-1',
        title: 'Number System & Simplification',
        subtopics: [
          'Classification of Real Numbers, Integers, Rational and Irrational Numbers',
          'Divisibility Rules (2 to 13), Unit Digit and Remainder Theorems',
          'HCF and LCM: Prime Factorization and Division Methods',
          'BODMAS Rules, Fractions, Decimals, Surds and Indices',
          'Algebraic Identities and Quick Simplification Shortcuts',
        ],
      },
      {
        id: 'apt-2',
        title: 'Arithmetic (Percentages, Ratio & Proportion)',
        subtopics: [
          'Percentages: Fraction-to-Percentage Equivalents & Successive Percentage Changes',
          'Profit, Loss, Discount and Marked Price Calculations',
          'Ratio, Proportion and Variation (Direct & Inverse)',
          'Partnership Problems with Equal and Unequal Capital/Time',
          'Mixtures and Alligations: Replacement & Concentration Rules',
        ],
      },
      {
        id: 'apt-3',
        title: 'Time & Work',
        subtopics: [
          'Unitary Method and Rate of Work per Day',
          'Efficiency Method & Men-Days-Hours (M1D1H1 = M2D2H2)',
          'Pipes and Cisterns: Inlets, Outlets & Leakage Rates',
          'Alternate Days Working Problems and Wage Distribution',
          'Combined Work by Groups of Men, Women, and Boys',
        ],
      },
      {
        id: 'apt-4',
        title: 'Speed, Distance & Time',
        subtopics: [
          'Basic Relations, Unit Conversion (km/h to m/s) and Average Speed',
          'Relative Speed Concepts in Same and Opposite Directions',
          'Trains: Crossing Poles, Platforms and Moving Trains',
          'Boats and Streams: Upstream, Downstream and Current Speeds',
          'Races, Head Starts and Circular Track Meeting Points',
        ],
      },
      {
        id: 'apt-5',
        title: 'Interest (Simple & Compound)',
        subtopics: [
          'Simple Interest Formulas and Application Scenarios',
          'Compound Interest: Compounded Annually, Half-Yearly and Quarterly',
          'Difference between CI and SI for 2 Years and 3 Years (Shortcut Formulas)',
          'Effective Annual Rate of Interest Calculations',
          'Installments and Loan Repayment Calculations',
        ],
      },
      {
        id: 'apt-6',
        title: 'Averages & Ages',
        subtopics: [
          'Arithmetic Average, Weighted Average and Deviation Method',
          'Inclusion, Exclusion and Replacement of Group Members',
          'Age Word Problems involving Current, Past and Future Ratios',
          'Combined Averages of Multiple Disjoint Groups',
          'Bowling and Batting Averages in Cricket Word Problems',
        ],
      },
      {
        id: 'apt-7',
        title: 'Logical Reasoning',
        subtopics: [
          'Blood Relations: Family Tree Diagrams and Coded Relationships',
          'Direction and Distance Sense Test with Multi-Turn Trajectories',
          'Seating Arrangements: Linear, Double Row, and Circular Tables',
          'Syllogisms: Venn Diagram Representation and Deductive Logic',
          'Statements and Assumptions, Conclusions and Course of Action',
        ],
      },
      {
        id: 'apt-8',
        title: 'Series & Patterns',
        subtopics: [
          'Arithmetic, Geometric and Fibonacci Number Series',
          'Two-Tier Differences and Alternating Number Sequences',
          'Alphabet and Letter Series with Positional Value Rules',
          'Coding-Decoding: Letter Shifting, Reverse Coding and Coded Sentences',
          'Analogy and Odd-One-Out Classification',
        ],
      },
      {
        id: 'apt-9',
        title: 'Height & Distance',
        subtopics: [
          'Angles of Elevation and Depression Definitions',
          'Right Triangle Trigonometric Ratios (30°, 45°, 60° Shortcut Triangles)',
          'Two-Point Distance Problems with Moving Observers',
          'Lighthouse Observation Problems (Maritime Practical Scenarios)',
          'Shadow Lengths and Sun Elevation Calculations',
        ],
      },
      {
        id: 'apt-10',
        title: 'Calendar & Clocks',
        subtopics: [
          'Odd Days Concepts, Leap Year vs Ordinary Year Rules',
          'Finding the Exact Day of the Week for Any Given Date',
          'Calendar Repetition and Century Day Limits',
          'Angle between Hour Hand and Minute Hand at Any Time',
          'Clock Coincidence, Straight Opposite Hands and Gain/Loss Rates',
        ],
      },
    ],
  },
  {
    id: 'english',
    name: 'English Language',
    weightage: '40 Questions (40 Marks)',
    shortLabel: '40Q',
    description: 'Grammar, Maritime Vocabulary, Error Correction, Voice & Reading Comprehension',
    topics: [
      {
        id: 'eng-1',
        title: 'Grammar Basics',
        subtopics: [
          'Parts of Speech: Nouns, Pronouns, Adjectives, Adverbs, Prepositions & Conjunctions',
          'Subject-Verb Agreement Rules and Exceptions',
          'Tenses and Their Correct Usage in Conditional Sentences',
          'Articles (A, An, The) and Determiners with Omission Rules',
          'Prepositions of Time, Place, Direction and Fixed Prepositions',
        ],
      },
      {
        id: 'eng-2',
        title: 'Vocabulary & Idioms',
        subtopics: [
          'High-Frequency IMUCET Synonyms and Antonyms',
          'Frequently Tested Idioms, Phrases and Proverbial Usage',
          'One-Word Substitutions for Scientific and Administrative Roles',
          'Maritime & Nautical Terminology (Port, Starboard, Helm, Bow, Stern, Knot)',
          'Common Confusing Words and Homophones (e.g., Affect vs Effect)',
        ],
      },
      {
        id: 'eng-3',
        title: 'Sentence Correction & Spotting Errors',
        subtopics: [
          'Identifying Grammatical Errors in Divided Sentence Segments',
          'Modifier Placement Errors and Dangling Participles',
          'Parallel Structure in Coordinate and Comparative Clauses',
          'Redundancy, Repetition and Wordiness Elimination',
          'Punctuation Errors and Sentence Fragment Corrections',
        ],
      },
      {
        id: 'eng-4',
        title: 'Voice & Speech',
        subtopics: [
          'Active to Passive Voice Transformation Rules for All Tenses',
          'Passive Voice for Imperative Sentences, Orders and Requests',
          'Direct to Indirect Speech Rules for Assertive Sentences',
          'Reported Speech for Interrogative, Exclamatory and Imperative Sentences',
          'Reporting Verbs and Time/Place Adverb Changes in Indirect Speech',
        ],
      },
      {
        id: 'eng-5',
        title: 'Reading Comprehension',
        subtopics: [
          'Skimming and Scanning Techniques for Maritime & Technical Passages',
          'Identifying Main Idea, Central Theme and Supporting Arguments',
          'Inference and Deductive Questions Based on Passage Facts',
          'Vocabulary in Context: Contextual Meaning of Difficult Words',
          'Tone, Mood and Author’s Objective Assessment',
        ],
      },
    ],
  },
];

// ─── STRICT COLOR THEME TOKENS ────────────────────────────────────────────────
// Backgrounds: #FFFFFF, #F8FAFC, #F1F5F9
// Text: #0F172A, #475569, #64748B, #94A3B8
// Accent/borders: #E2E8F0, #CBD5E1
// Active/highlight: #0F172A
// STRICT RULE: Absolutely NO green, red, orange, or purple!

export default function Notes() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('mathematics');
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadUserAndPlan() {
      try {
        setLoading(true);
        let currentUser = null;
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          currentUser = authData.user;
          setUser(currentUser);
        } else {
          try {
            const stored = JSON.parse(localStorage.getItem('user') || 'null');
            if (stored?.id) {
              currentUser = stored;
              setUser(currentUser);
              if (stored.plan) setProfile({ plan: stored.plan });
            }
          } catch (e) {}
        }

        if (currentUser?.id) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('id, full_name, email, plan')
            .eq('id', currentUser.id)
            .single();

          if (pData) {
            setProfile(pData);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserAndPlan();
  }, []);

  const isPro = profile?.plan === 'pro' || profile?.plan === 'pro_max';

  const currentSubject =
    SYLLABUS.find((s) => s.id === selectedSubjectId) || SYLLABUS[0];

  const handleTopicClick = (topicId, isLocked) => {
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Mobile topbar */}
        <div
          style={{
            display: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="mobile-topbar"
        >
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button
            onClick={() => setMobileOpen(true)}
            type="button"
            aria-label="Open navigation menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0F172A',
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            ☰
          </button>
        </div>

        {/* Desktop Topbar Header */}
        <header
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 28px',
            minHeight: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A', letterSpacing: '-0.02em' }}>
              IMUCET Syllabus Notes
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Official curriculum breakdown, core subtopics &amp; high-yield revision summaries
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isPro ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#0F172A',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 6,
                  padding: '5px 12px',
                  letterSpacing: '0.04em',
                }}
              >
                PRO MEMBER
              </span>
            ) : (
              <button
                onClick={() => setShowUpgradeModal(true)}
                type="button"
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <div
          style={{
            maxWidth: 1120,
            width: '100%',
            margin: '0 auto',
            padding: 'clamp(12px, 4vw, 28px)',
            boxSizing: 'border-box',
          }}
        >
          {/* Pro Upgrade Banner at Top for Free Users */}
          {!isPro && !loading && (
            <div
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 24px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  IMUpilot Pro Access
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    marginBottom: 4,
                  }}
                >
                  Unlock Full Notes for All 58+ IMUCET Chapters
                </div>
                <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.4 }}>
                  Free plan gives you access to the first 3 topics in every subject. Upgrade to unlock
                  complete subtopics, upcoming formula sheets, and chapter PDF downloads.
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                type="button"
                style={{
                  background: '#FFFFFF',
                  color: '#0F172A',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px 22px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Upgrade — ₹999
              </button>
            </div>
          )}

          {/* Subject Switcher Tabs (Pill style) */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Select Subject
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
                scrollbarWidth: 'none',
              }}
            >
              {SYLLABUS.map((subj) => {
                const isActive = subj.id === selectedSubjectId;
                return (
                  <button
                    key={subj.id}
                    onClick={() => {
                      setSelectedSubjectId(subj.id);
                      setExpandedTopicId(null);
                    }}
                    type="button"
                    style={{
                      background: isActive ? '#0F172A' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: `1px solid ${isActive ? '#0F172A' : '#E2E8F0'}`,
                      borderRadius: 999,
                      padding: '8px 18px',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(15, 23, 42, 0.12)' : 'none',
                    }}
                  >
                    <span>{subj.name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: isActive ? '#FFFFFF' : '#F1F5F9',
                        color: isActive ? '#0F172A' : '#64748B',
                      }}
                    >
                      {subj.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Header & Info Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '18px 22px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {currentSubject.name}
                </h1>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#475569',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  {currentSubject.weightage}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>
                {currentSubject.description}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 13,
                color: '#475569',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                  {currentSubject.topics.length}
                </span>{' '}
                Total Topics
              </div>
              <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
              <div>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                  {isPro ? currentSubject.topics.length : Math.min(3, currentSubject.topics.length)}
                </span>{' '}
                {isPro ? 'Unlocked (Full Pro)' : 'Free Topics'}
              </div>
            </div>
          </div>

          {/* Topics Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentSubject.topics.map((topic, index) => {
              const isLocked = !isPro && index >= 3;
              const isExpanded = expandedTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${isExpanded ? '#CBD5E1' : '#E2E8F0'}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Topic Header Row */}
                  <div
                    onClick={() => handleTopicClick(topic.id, isLocked)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTopicClick(topic.id, isLocked);
                      }
                    }}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      background: isLocked ? '#F8FAFC' : '#FFFFFF',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                      {/* Topic Number Tag */}
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: isLocked ? '#F1F5F9' : '#0F172A',
                          color: isLocked ? '#94A3B8' : '#FFFFFF',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: isLocked ? '#64748B' : '#0F172A',
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {topic.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                          {topic.subtopics.length} key subtopics &amp; concepts
                        </div>
                      </div>
                    </div>

                    {/* Status Pill / Toggle Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
                      {isLocked ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: 999,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#0F172A',
                          }}
                        >
                          {/* Lock Icon */}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <span>PRO ONLY</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#64748B',
                              background: '#F1F5F9',
                              borderRadius: 6,
                              padding: '2px 8px',
                            }}
                          >
                            UNLOCKED
                          </span>
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              color: '#475569',
                              transition: 'transform 0.2s ease',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                          >
                            {/* Chevron Down Icon */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content (Subtopics + Coming Soon Placeholder) */}
                  {isExpanded && !isLocked && (
                    <div
                      style={{
                        borderTop: '1px solid #F1F5F9',
                        background: '#F8FAFC',
                        padding: '20px 22px',
                      }}
                    >
                      {/* Subtopics Header */}
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: 12,
                        }}
                      >
                        Syllabus Subtopics &amp; Focus Areas
                      </div>

                      {/* Subtopic Items */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: 10,
                          marginBottom: 18,
                        }}
                      >
                        {topic.subtopics.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: 8,
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              fontSize: 13,
                              color: '#0F172A',
                              lineHeight: 1.4,
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#475569',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              {sIdx + 1}
                            </span>
                            <span>{sub}</span>
                          </div>
                        ))}
                      </div>

                      {/* Chapter PDF Coming Soon Placeholder */}
                      <div
                        style={{
                          background: '#FFFFFF',
                          border: '1px dashed #CBD5E1',
                          borderRadius: 10,
                          padding: '16px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 14,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {/* File / Doc Icon */}
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#475569',
                              flexShrink: 0,
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 650, color: '#0F172A' }}>
                              Chapter PDF coming soon
                            </div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>
                              Curated formula cheat-sheets, solved past-year questions, and quick revision cards.
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: '#475569',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            padding: '4px 10px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Under Preparation
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Upgrade Nudge Card for Free Users */}
          {!isPro && !loading && (
            <div
              style={{
                marginTop: 36,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: 'clamp(16px, 4vw, 28px)',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 24,
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: 6,
                  }}
                >
                  IMUpilot Pro Membership
                </span>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    margin: '0 0 8px 0',
                  }}
                >
                  Need unlimited access to all chapters and test series?
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#64748B',
                    margin: '0 0 16px 0',
                    lineHeight: 1.5,
                  }}
                >
                  Upgrade to IMUpilot Pro to unlock complete study notes, 10 full-length CBT mock tests,
                  smart revision flashcards, and dedicated mock interviews.
                </p>

                {/* Feature checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                  {[
                    'All 58+ topic notes across all 5 subjects',
                    'Full-length CBT mock tests with rank analysis',
                    'Smart Spaced Repetition Flashcards',
                    '10 Complimentary 1-on-1 Mock Interviews',
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      {/* Strictly Monochrome Check Icon */}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Upgrade CTA */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: '22px 26px',
                  textAlign: 'center',
                  minWidth: 220,
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 2 }}>
                  All-Inclusive Plan
                </div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  ₹999
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 16 }}>
                  One-time · Lifetime validity
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  type="button"
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '11px 22px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                  }}
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={user?.id}
        title="Unlock All IMUCET Notes"
        subtitle="Get instant access to all 58+ chapter notes, formula sheets, full CBT mock tests and mock interviews."
      />
    </div>
  );
}
