/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Download, 
  Terminal, 
  Shield, 
  Cpu, 
  User as UserIcon, 
  Briefcase, 
  Code2, 
  ChevronRight,
  ExternalLink,
  Globe,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  Lock,
  Phone,
  MapPin,
  Star,
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  updateDoc,
  setDoc,
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp,
  User,
  ref,
  uploadBytes,
  getDownloadURL,
  storage
} from './firebase';

// --- Types ---

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  createdAt: any;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

interface Language {
  name: string;
  level: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  points: string[];
}

interface Education {
  degree: string;
  institution: string;
  period: string;
  points: string[];
}

interface Certification {
  title: string;
  subtitle: string;
  period: string;
  points: string[];
}

interface PersonalSkill {
  name: string;
  description: string;
}

interface TechSkill {
  name: string;
  level: number;
}

interface ContactInfo {
  phone: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
}

interface IntroCard {
  title: string;
  description: string;
  icon: string;
}

interface LanguageData {
  fullName: string;
  introText: string;
  jobTitle: string;
  statusLine: string;
  bio: string;
  profileText: string;
  aboutMe: string;
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  personalSkills: PersonalSkill[];
  introCards: IntroCard[];
}

interface SiteConfig {
  en: LanguageData;
  pt: LanguageData;
  profileImage: string;
  contacts: ContactInfo;
  technicalSkills: TechSkill[];
  languages: Language[];
}

const DEFAULT_CONFIG: SiteConfig = {
  en: {
    fullName: "Daniil Kachkovskyy",
    introText: "Hi! I'm Daniil Kachkovskyy, a student of Information Technologies Management at Universidade Lusófona in Lisbon.",
    jobTitle: "IT Management Student | System Administration & Architecture Enthusiast",
    statusLine: "Building stable and efficient systems...",
    bio: "I'm deeply enthusiastic about system administration and system architecture. I focus on building stable, scalable, and efficient technological infrastructures, with a strong parallel interest in cybersecurity to ensure every system I design is inherently secure.",
    profileText: "I'm currently pursuing a Bachelor's degree in Information Technologies Management, focusing on system architecture, administration, and secure infrastructure design.",
    aboutMe: "I am an Information Technology Management student with an interest in programming, systems administration, and cybersecurity. I have been responsible for the checkout team at my workplace, which helped me develop leadership, organization, and communication skills. In the future, I intend to pursue a career in the field of information technology, with a special interest in systems administration and architecture, networking, and cybersecurity. I want to contribute to the construction and maintenance of secure, stable, and efficient technological infrastructures that have a positive impact on the lives of people and organizations.",
    experiences: [
      {
        title: "CHECKOUT OPERATOR / TEAM LEAD",
        company: "INTERMARCHÉ – ALGUEIRÃO-MEM MARTINS",
        period: "March 2024 – Present",
        points: [
          "Customer service and checkout payment management",
          "Responsible for coordinating the checkout team",
          "Development of skills in communication, responsibility, and teamwork"
        ]
      }
    ],
    education: [
      {
        degree: "BACHELOR'S IN MANAGEMENT INFORMATICS",
        institution: "UNIVERSIDADE LUSÓFONA DE HUMANIDADES E TECNOLOGIAS – LISBOA",
        period: "September 2024 – Present",
        points: [
          "Focus on programming (Java, C), mathematics, statistics, and information systems fundamentals",
          "In development: algorithmic thinking, behavioral skills, and logical reasoning"
        ]
      }
    ],
    certifications: [
      {
        title: "INTRODUCTION TO INFORMATION SECURITY",
        subtitle: "PROFESSIONAL TRAINING CERTIFICATE",
        period: "March 2025",
        points: ["Information Security", "ISO/IEC 27001", "NIS2", "DORA Regulation"]
      }
    ],
    personalSkills: [
      { name: "Sense of responsibility and organization", description: "Responsible for coordinating the checkout team" },
      { name: "Good communication and teamwork skills", description: "Collaboration with different sales areas within the store" },
      { name: "Customer Service", description: "Creating bonds of trust with customers as a checkout operator" }
    ],
    introCards: [
      {
        title: "Future Focus",
        description: "Aspiring to design stable, scalable, and high-performance infrastructures.",
        icon: "Cpu"
      },
      {
        title: "System Management",
        description: "Learning to manage and optimize complex server environments and networks.",
        icon: "Terminal"
      }
    ]
  },
  pt: {
    fullName: "Daniil Kachkovskyy",
    introText: "Olá! Sou o Daniil Kachkovskyy, estudante de Informática de Gestão na Universidade Lusófona em Lisboa.",
    jobTitle: "Estudante de Informática de Gestão | Entusiasta de Administração e Arquitetura de Sistemas",
    statusLine: "Construindo sistemas estáveis e eficientes...",
    bio: "Sou profundamente entusiasta pela administração e arquitetura de sistemas. Foco-me na construção de infraestruturas tecnológicas estáveis, escaláveis e eficientes, com um forte interesse paralelo em cibersegurança para garantir que cada sistema que desenho seja inerentemente seguro.",
    profileText: "Estou atualmente a tirar a Licenciatura em Informática de Gestão, com foco em arquitetura de sistemas, administração e design de infraestruturas seguras.",
    aboutMe: "Sou estudante de Informática de Gestão com interesse em programação, administração de sistemas e cibersegurança. Já fui responsável pela equipa de caixas no meu local de trabalho, o que me ajudou a desenvolver competências de liderança, organização e comunicação. No futuro, pretendo seguir uma carreira na área das tecnologias da informação, com especial interesse em administração e arquitetura de sistemas, redes e cibersegurança. Quero contribuir para a construção e manutenção de infraestruturas tecnológicas seguras, estáveis e eficientes, que tenham impacto positivo na vida das pessoas e das organizações.",
    experiences: [
      {
        title: "OPERADOR / RESPONSÁVEL DE CAIXA",
        company: "INTERMARCHÉ – ALGUEIRÃO-MEM MARTINS",
        period: "Março 2024 – Presente",
        points: [
          "Atendimento ao público e gestão de pagamentos em caixa",
          "Responsável pela coordenação da equipa de caixas",
          "Desenvolvimento de competências em comunicação, responsabilidade e trabalho em equipa"
        ]
      }
    ],
    education: [
      {
        degree: "LICENCIATURA EM INFORMÁTICA DE GESTÃO",
        institution: "UNIVERSIDADE LUSÓFONA DE HUMANIDADES E TECNOLOGIAS – LISBOA",
        period: "Setembro 2024 – Presente",
        points: [
          "Foco em programação (Java, C), matemática, estatística, e fundamentos de sistemas de informação",
          "Em desenvolvimento: pensamento algorítmico, competências comportamentais e raciocínio lógico"
        ]
      }
    ],
    certifications: [
      {
        title: "INTRODUÇÃO À SEGURANÇA DA INFORMAÇÃO",
        subtitle: "CERTIFICADO DE FORMAÇÃO PROFISSIONAL",
        period: "Março de 2025",
        points: ["Segurança da Informação", "ISO/IEC 27001", "NIS2", "Regulamento DORA"]
      }
    ],
    personalSkills: [
      { name: "Sentido de responsabilidade e organização", description: "Responsável pela coordenação da equipa das caixas" },
      { name: "Boa capacidade de comunicação e trabalho em equipa", description: "Colaboração com as diferentes áreas de venda dentro da loja" },
      { name: "Atendimento ao Público", description: "Criando laços de confiança com os clientes como operador de caixa" }
    ],
    introCards: [
      {
        title: "Foco Futuro",
        description: "Aspirando a projetar infraestruturas estáveis, escaláveis e de alto desempenho.",
        icon: "Cpu"
      },
      {
        title: "Gestão de Sistemas",
        description: "Aprendendo a gerir e otimizar ambientes de servidores e redes complexos.",
        icon: "Terminal"
      }
    ]
  },
  profileImage: "https://picsum.photos/seed/daniil/400/400",
  contacts: {
    phone: "+351 934 988 323",
    email: "dan.kachkyy@gmail.com",
    location: "Lisboa, Portugal",
    github: "ClumsyNoodlester",
    linkedin: "dankachkyy",
    website: "daniil.dev"
  },
  technicalSkills: [
    { name: "Python", level: 4 },
    { name: "Kotlin", level: 3 },
    { name: "Java", level: 2 },
    { name: "C", level: 2 }
  ],
  languages: [
    { name: 'Portuguese', level: 'Native' },
    { name: 'English', level: 'Fluent' },
    { name: 'Russian', level: 'Basic' }
  ]
};

import { useReactToPrint } from 'react-to-print';

// --- Components ---

const CV = React.forwardRef<HTMLDivElement, { config: SiteConfig, lang: 'en' | 'pt' }>(({ config, lang }, ref) => {
  const data = config[lang];
  const isPt = lang === 'pt';

  const StarRating = ({ level }: { level: number }) => (
    <div className="flex gap-0.5" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={10} 
          className={s <= level ? "fill-white text-white" : "text-zinc-600"} 
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
        />
      ))}
    </div>
  );

  return (
    <div ref={ref} className="bg-white text-black font-sans w-[210mm] h-[297mm] flex shadow-2xl overflow-hidden print:shadow-none print:flex" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      {/* Sidebar */}
      <div className="w-[32%] bg-[#2d2d2d] text-white p-6 flex flex-col gap-6" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
        {/* Profile Image */}
        <div className="flex justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-white/10 overflow-hidden bg-zinc-800">
            <img 
              src={config.profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Contacts */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <UserIcon size={14} />
            {isPt ? 'Contactos' : 'Contacts'}
          </h2>
          <ul className="space-y-3 text-[10px]">
            <li className="flex items-center gap-3">
              <Phone size={12} className="text-zinc-400" />
              {config.contacts.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail size={12} className="text-zinc-400" />
              {config.contacts.email}
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={12} className="text-zinc-400" />
              {config.contacts.location}
            </li>
            <li className="flex items-center gap-3">
              <Github size={12} className="text-zinc-400" />
              <a href={`https://github.com/${config.contacts.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                github.com/{config.contacts.github}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Linkedin size={12} className="text-zinc-400" />
              <a href={`https://linkedin.com/in/${config.contacts.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                linkedin.com/in/{config.contacts.linkedin}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Globe size={12} className="text-zinc-400" />
              <a href={config.contacts.website.startsWith('http') ? config.contacts.website : `https://${config.contacts.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                {config.contacts.website}
              </a>
            </li>
          </ul>
        </section>

        {/* Technical Skills */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <Cpu size={14} />
            {isPt ? 'Competências Técnicas' : 'Technical Skills'}
          </h2>
          <ul className="space-y-2">
            {config.technicalSkills.map((skill, i) => (
              <li key={i} className="flex justify-between items-center text-[10px]">
                <span className="font-mono">{skill.name}</span>
                <StarRating level={skill.level} />
              </li>
            ))}
          </ul>
        </section>

        {/* Personal Skills */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <UserIcon size={14} />
            {isPt ? 'Competências Pessoais' : 'Personal Skills'}
          </h2>
          <ul className="space-y-4 text-[10px]">
            {data.personalSkills.map((skill, i) => (
              <li key={i}>
                <p className="font-bold underline mb-1">{skill.name}</p>
                <p className="text-zinc-400 leading-tight">{skill.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Languages */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
            <Globe size={14} />
            {isPt ? 'Linguísticos' : 'Languages'}
          </h2>
          <ul className="space-y-2 text-[10px]">
            {config.languages.map((lang, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-bold">{lang.name}</span>
                <span className="text-zinc-400">— {lang.level}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 flex flex-col gap-6">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-black text-[#2d2d2d] uppercase tracking-tight leading-none mb-2">
            {(data.fullName || "Daniil Kachkovskyy").split(' ').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}{i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em]">
            {data.jobTitle}
          </p>
        </header>

        {/* About Me */}
        <section>
          <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3 mb-4 text-[#2d2d2d]">
            <UserIcon size={20} className="text-[#2d2d2d]" />
            {isPt ? 'Sobre Mim' : 'About Me'}
          </h2>
          <p className="text-xs leading-relaxed text-zinc-700 text-justify">
            {data.aboutMe}
          </p>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3 mb-4 text-[#2d2d2d]">
            <GraduationCap size={18} className="text-[#2d2d2d]" />
            {isPt ? 'Formação Académica' : 'Education'}
          </h2>
          <div className="space-y-5 border-l-2 border-zinc-100 ml-2.5 pl-6">
            {data.education.map((edu, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white" />
                <h3 className="text-sm font-bold text-[#2d2d2d] mb-1">{edu.degree}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{edu.institution}</p>
                <p className="text-[10px] text-orange-500 font-mono mb-3">{edu.period}</p>
                <ul className="text-[10px] text-zinc-600 space-y-1 list-disc pl-4">
                  {edu.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section>
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3 mb-4 text-[#2d2d2d]">
            <Award size={18} className="text-[#2d2d2d]" />
            {isPt ? 'Certificações' : 'Certifications'}
          </h2>
          <div className="space-y-5 border-l-2 border-zinc-100 ml-2.5 pl-6">
            {data.certifications.map((cert, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white" />
                <h3 className="text-sm font-bold text-[#2d2d2d] mb-1">{cert.title}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{cert.subtitle}</p>
                <p className="text-[10px] text-orange-500 font-mono mb-3">{cert.period}</p>
                <ul className="text-[10px] text-zinc-600 space-y-1 list-disc pl-4">
                  {cert.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-3 mb-4 text-[#2d2d2d]">
            <Briefcase size={18} className="text-[#2d2d2d]" />
            {isPt ? 'Experiência Profissional' : 'Experience'}
          </h2>
          <div className="space-y-5 border-l-2 border-zinc-100 ml-2.5 pl-6">
            {data.experiences.map((exp, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white" />
                <h3 className="text-sm font-bold text-[#2d2d2d] mb-1">{exp.title}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{exp.company}</p>
                <p className="text-[10px] text-orange-500 font-mono mb-3">{exp.period}</p>
                <ul className="text-[10px] text-zinc-600 space-y-1 list-disc pl-4">
                  {exp.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
});

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  
  const logPool = [
    "INITIALIZING SYSTEM KERNEL...",
    "LOADING IT MANAGEMENT MODULES...",
    "MOUNTING SYSTEM_ARCHITECTURE.BIN...",
    "ESTABLISHING SECURE CONNECTION...",
    "VERIFYING ADMIN CREDENTIALS...",
    "BOOTING PORTFOLIO INTERFACE...",
    "SCANNING NETWORK TOPOLOGY...",
    "DECRYPTING SECURITY PROTOCOLS...",
    "ALLOCATING VIRTUAL MEMORY...",
    "SYNCING DATABASE CLUSTERS...",
    "OPTIMIZING SYSTEM THROUGHPUT...",
    "CHECKING FIREWALL INTEGRITY...",
    "LOADING NEURAL INTERFACE...",
    "CALIBRATING SENSORS...",
    "BYPASSING ENCRYPTION LAYERS...",
    "RECONSTRUCTING DATA PACKETS...",
    "MAPPING CLOUD INFRASTRUCTURE...",
    "ISOLATING MALWARE SIGNATURES...",
    "UPDATING ARCHITECTURE SCHEMAS...",
    "ESTABLISHING NEURAL HANDSHAKE...",
    "REDUNDANCY CHECK IN PROGRESS...",
    "FLUSHING CACHE BUFFERS...",
    "RE-INDEXING SYSTEM REGISTRY...",
    "INITIALIZING CRYPTO-MODULES...",
    "SYSTEM READY."
  ];

  const selectedLogs = useMemo(() => {
    const shuffled = [...logPool.slice(0, -1)].sort(() => 0.5 - Math.random());
    return [...shuffled.slice(0, 6), logPool[logPool.length - 1]];
  }, []);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let currentLog = 0;
      const logInterval = setInterval(() => {
        if (currentLog < selectedLogs.length) {
          const logToAdd = `> ${selectedLogs[currentLog]}`;
          setLogs(prev => {
            if (prev.includes(logToAdd)) return prev;
            return [...prev, logToAdd];
          });
          currentLog++;
        } else {
          clearInterval(logInterval);
          setTimeout(onComplete, 500);
        }
      }, 400);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      // Store intervals in a way that they can be cleared
      (window as any)._logInterval = logInterval;
      (window as any)._progressInterval = progressInterval;
    }, 50);

    return () => {
      clearTimeout(startTimeout);
      clearInterval((window as any)._logInterval);
      clearInterval((window as any)._progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 font-mono">
      <div className="w-full max-w-lg">
        <div className="mb-8 space-y-2">
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-orange-500 text-sm"
            >
              {log}
            </motion.div>
          ))}
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-zinc-600 uppercase tracking-widest">
          <span>Booting...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (project: Project) => void;
}

function ProjectCard({ project, isAdmin, onDelete, onEdit }: ProjectCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all group relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{project.title}</h3>
        <div className="flex gap-2">
          {project.link && (
            <a href={project.link} target="_blank" className="text-zinc-500 hover:text-white transition-colors">
              <ExternalLink size={18} />
            </a>
          )}
          {isAdmin && (
            <div className="flex gap-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(project)}
                  className="text-orange-500/50 hover:text-orange-500 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(project.id)}
                  className="text-red-500/50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className="text-[10px] font-mono uppercase px-2 py-1 bg-zinc-800 rounded border border-white/5 text-zinc-500">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [index, text]);

  return (
    <span className="font-mono text-orange-400 border-r-2 border-orange-400 pr-1 animate-pulse">
      {displayedText}
    </span>
  );
};

const Section = ({ id, title, children, activeSection }: { id: string, title: string, children: React.ReactNode, activeSection: string }) => {
  if (activeSection !== id) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <h2 className="text-2xl font-mono font-bold tracking-tight text-white uppercase">{title}</h2>
      </div>
      <div className="text-zinc-400 leading-relaxed font-sans">
        {children}
      </div>
    </motion.div>
  );
};

const NavItem = ({ id, label, icon: Icon, activeSection, onClick }: { id: string, label: string, icon: any, activeSection: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`group flex flex-col items-center gap-2 p-4 transition-all duration-300 ${
      activeSection === id 
        ? 'text-orange-400 scale-110' 
        : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    <div className={`p-3 rounded-xl border transition-all duration-300 ${
      activeSection === id 
        ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
        : 'bg-zinc-800/50 border-white/5 group-hover:border-white/20'
    }`}>
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{label}</span>
  </button>
);

// --- Main App ---

const getIcon = (name: string) => {
  const icons: Record<string, any> = {
    Cpu, Terminal, Shield, UserIcon, Briefcase, Code2, Globe, Star, GraduationCap, Award, BookOpen, Mail, Github, Linkedin
  };
  const Icon = icons[name] || Cpu;
  return <Icon className="text-orange-500 mb-2" size={20} />;
};

export default function App() {
  const isPrintMode = useMemo(() => new URLSearchParams(window.location.search).get('print') === 'true', []);
  const printLang = useMemo(() => (new URLSearchParams(window.location.search).get('lang') as 'en' | 'pt') || 'en', []);

  const [activeSection, setActiveSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [configTab, setConfigTab] = useState<'basic' | 'contacts' | 'intro' | 'experience' | 'education' | 'certs' | 'skills' | 'languages'>('basic');
  const [isUploading, setIsUploading] = useState(false);
  const [lang, setLang] = useState<'en' | 'pt'>(isPrintMode ? printLang : 'en');
  const [editLang, setEditLang] = useState<'en' | 'pt'>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isViewingMessages, setIsViewingMessages] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '', honeypot: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const cvRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: cvRef,
    documentTitle: `Daniil_Kachkovskyy_CV_${lang.toUpperCase()}`,
    onAfterPrint: () => console.log("Print completed"),
    onPrintError: (error) => console.error("Print error:", error),
  });

  const onDownloadCV = () => {
    const printUrl = `${window.location.origin}${window.location.pathname}?print=true&lang=${lang}`;
    window.open(printUrl, '_blank');
  };

  // Auto-print in print mode
  useEffect(() => {
    if (isPrintMode && !isLoading && cvRef.current) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 1000); // Give it a second to settle
      return () => clearTimeout(timer);
    }
  }, [isPrintMode, isLoading, handlePrint]);
  
  // Form State
  const [newProject, setNewProject] = useState({ title: '', description: '', tags: '', link: '' });
  const [configForm, setConfigForm] = useState<SiteConfig>(DEFAULT_CONFIG);

  const isAdmin = user?.email === "dan.kachkyy@gmail.com";

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projs);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        
        // Robust merging with DEFAULT_CONFIG to ensure all fields exist
        const merged: SiteConfig = {
          ...DEFAULT_CONFIG,
          ...data,
          en: {
            ...DEFAULT_CONFIG.en,
            ...(data.en || {}),
            introCards: data.en?.introCards || DEFAULT_CONFIG.en.introCards
          },
          pt: {
            ...DEFAULT_CONFIG.pt,
            ...(data.pt || {}),
            introCards: data.pt?.introCards || DEFAULT_CONFIG.pt.introCards
          }
        };

        // Handle legacy structure migration if necessary
        if (!data.en && !data.pt) {
          merged.en.fullName = data.fullName || DEFAULT_CONFIG.en.fullName;
          merged.en.introText = data.introText || DEFAULT_CONFIG.en.introText;
          merged.en.jobTitle = data.jobTitle || DEFAULT_CONFIG.en.jobTitle;
          merged.en.statusLine = data.statusLine || DEFAULT_CONFIG.en.statusLine;
          merged.en.bio = data.bio || DEFAULT_CONFIG.en.bio;
          merged.en.profileText = data.profileText || DEFAULT_CONFIG.en.profileText;
          merged.en.experiences = data.experiences || DEFAULT_CONFIG.en.experiences;
        }

        setSiteConfig(merged);
        setConfigForm(merged);
        if (isPrintMode) setIsLoading(false);
      }
    });

    let unsubscribeMessages: () => void = () => {};
    if (user?.email === "dan.kachkyy@gmail.com") {
      const mq = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      unsubscribeMessages = onSnapshot(mq, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(msgs);
      }, (error) => {
        console.error("Messages fetch error:", error);
      });
    }

    return () => {
      unsubscribeAuth();
      unsubscribeProjects();
      unsubscribeConfig();
      unsubscribeMessages();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      await addDoc(collection(db, 'projects'), {
        title: newProject.title,
        description: newProject.description,
        tags: newProject.tags.split(',').map(t => t.trim()),
        link: newProject.link,
        createdAt: Timestamp.now()
      });
      setNewProject({ title: '', description: '', tags: '', link: '' });
      setIsAddingProject(false);
    } catch (error) {
      console.error("Failed to add project", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingProject) return;

    try {
      await updateDoc(doc(db, 'projects', editingProject.id), {
        title: editingProject.title,
        description: editingProject.description,
        tags: Array.isArray(editingProject.tags) ? editingProject.tags : (editingProject.tags as unknown as string).split(',').map(t => t.trim()),
        link: editingProject.link
      });
      setEditingProject(null);
    } catch (error) {
      console.error("Failed to update project", error);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      await setDoc(doc(db, 'config', 'main'), configForm);
      setIsEditingConfig(false);
    } catch (error) {
      console.error("Failed to update config", error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profile/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setConfigForm(prev => ({ ...prev, profileImage: downloadURL }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Check your Firebase Storage rules.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check: if the hidden field is filled, it's a bot
    if (contactForm.honeypot) {
      console.log("Spam detected via honeypot");
      setSubmitStatus('success'); // Fake success to mislead the bot
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, 'messages'), {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        createdAt: Timestamp.now()
      });
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '', honeypot: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error("Failed to send message", error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  if (isPrintMode) {
    return (
      <div className="min-h-screen bg-white flex justify-center p-0 md:p-8">
        <CV ref={cvRef} config={siteConfig} lang={lang} />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden no-print">
        {/* Language Switcher */}
      <div className={`fixed right-4 z-[70] flex gap-2 bg-zinc-900/50 backdrop-blur-md p-1 rounded-lg border border-white/10 transition-all ${user ? 'top-16' : 'top-4'}`}>
        <button 
          onClick={() => setLang('en')}
          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded transition-all ${lang === 'en' ? 'bg-orange-500 text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('pt')}
          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded transition-all ${lang === 'pt' ? 'bg-orange-500 text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          PT
        </button>
      </div>

      {/* Admin Bar */}
      {user && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-orange-500' : 'bg-blue-500'} animate-pulse`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              {isAdmin ? 'Admin Session Active' : 'User Session Active'} // {user.email}
            </span>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsViewingMessages(true)}
                  className="text-[10px] font-mono uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2"
                >
                  <Mail size={12} />
                  Messages ({messages.length})
                </button>
                <button 
                  onClick={() => setIsEditingConfig(true)}
                  className="text-[10px] font-mono uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2"
                >
                  <Edit3 size={12} />
                  Edit Site Content
                </button>
              </>
            )}
            <button 
              onClick={handleLogout}
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        <AnimatePresence mode="wait">
          {activeSection === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-32 h-32 rounded-full border-2 border-orange-500/50 p-1 bg-zinc-900 overflow-hidden">
                  <img 
                    src={siteConfig.profileImage} 
                    alt="Daniil Kachkovskyy" 
                    className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-mono font-black text-white tracking-tighter mb-4 uppercase">
                Daniil <span className="text-orange-500">Kachkovskyy</span>
              </h1>
              
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg md:text-xl text-zinc-400 font-mono tracking-tight max-w-xl mx-auto">
                  {siteConfig[lang].jobTitle}
                </p>
                <div className="h-8">
                  <TypingText text={siteConfig[lang].statusLine} />
                </div>
              </div>

              <nav className="mt-12 flex flex-wrap justify-center gap-2 md:gap-6 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-2 rounded-2xl">
                <NavItem id="intro" label={lang === 'en' ? "Intro" : "Início"} icon={Terminal} activeSection={activeSection} onClick={() => setActiveSection('intro')} />
                <NavItem id="work" label={lang === 'en' ? "Career" : "Carreira"} icon={Briefcase} activeSection={activeSection} onClick={() => setActiveSection('work')} />
                <NavItem id="projects" label={lang === 'en' ? "Projects" : "Projetos"} icon={Code2} activeSection={activeSection} onClick={() => setActiveSection('projects')} />
                <NavItem id="about" label={lang === 'en' ? "About" : "Sobre"} icon={UserIcon} activeSection={activeSection} onClick={() => setActiveSection('about')} />
                <NavItem id="contact" label={lang === 'en' ? "Contact" : "Contacto"} icon={Mail} activeSection={activeSection} onClick={() => setActiveSection('contact')} />
              </nav>

              {!user && (
                <button 
                  onClick={handleLogin}
                  className="mt-8 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 hover:text-orange-500 transition-colors flex items-center gap-2"
                >
                  <Lock size={12} />
                  Admin Access
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <Section id="intro" title={lang === 'en' ? "System Initialization" : "Inicialização do Sistema"} activeSection={activeSection}>
                <div className="space-y-4">
                  <p className="text-lg text-white font-medium">
                    {siteConfig[lang].introText}
                  </p>
                  <p>
                    {siteConfig[lang].bio}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {(siteConfig[lang].introCards || []).map((card, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors">
                        {getIcon(card.icon)}
                        <h4 className="text-white font-mono text-sm uppercase mb-1">{card.title}</h4>
                        <p className="text-xs text-zinc-500">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section id="work" title={lang === 'en' ? "Execution History" : "Histórico de Execução"} activeSection={activeSection}>
                <div className="space-y-8">
                  {siteConfig[lang].experiences.map((exp, i) => (
                    <div key={i} className="relative pl-8 border-l border-orange-500/30">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                      <div className="mb-1 flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                        <span className="text-xs font-mono bg-orange-500/10 text-orange-400 px-2 py-1 rounded border border-orange-500/20">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-orange-500/80 font-mono text-sm mb-4">{exp.company}</p>
                      <ul className="space-y-2 text-sm">
                        {exp.points.map((point, j) => (
                          <li key={j} className="flex gap-2">
                            <ChevronRight size={16} className="text-orange-500 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {siteConfig[lang].experiences.length === 0 && (
                    <div className="text-center py-12 opacity-50 font-mono text-sm">
                      {lang === 'en' ? 'NO EXECUTION HISTORY FOUND.' : 'NENHUM HISTÓRICO DE EXECUÇÃO ENCONTRADO.'}
                    </div>
                  )}
                </div>
              </Section>

              <Section id="projects" title={lang === 'en' ? "Development Pipeline" : "Pipeline de Desenvolvimento"} activeSection={activeSection}>
                <div className="grid grid-cols-1 gap-6">
                  {projects.map(project => (
                    <div key={project.id}>
                      <ProjectCard 
                        project={project}
                        isAdmin={isAdmin}
                        onDelete={handleDeleteProject}
                        onEdit={setEditingProject}
                      />
                    </div>
                  ))}
                  
                  {isAdmin && (
                    <div className="space-y-4">
                      {!isAddingProject ? (
                        <button 
                          onClick={() => setIsAddingProject(true)}
                          className="w-full p-6 rounded-2xl border-2 border-dashed border-orange-500/20 hover:border-orange-500/50 flex flex-col items-center justify-center text-center transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Plus size={20} className="text-orange-500" />
                          </div>
                          <span className="text-xs font-mono uppercase text-orange-500/50 group-hover:text-orange-500 transition-colors">Deploy New Project</span>
                        </button>
                      ) : (
                        <motion.form 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onSubmit={handleAddProject}
                          className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-4"
                        >
                          <div className="grid grid-cols-1 gap-4">
                            <input 
                              required
                              placeholder="Project Title"
                              value={newProject.title || ''}
                              onChange={e => setNewProject({...newProject, title: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                            />
                            <textarea 
                              required
                              placeholder="Project Description"
                              value={newProject.description || ''}
                              onChange={e => setNewProject({...newProject, description: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                              rows={3}
                            />
                            <input 
                              required
                              placeholder="Tags (comma separated: Python, React, etc)"
                              value={newProject.tags || ''}
                              onChange={e => setNewProject({...newProject, tags: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                            />
                            <input 
                              placeholder="Project Link (GitHub URL)"
                              value={newProject.link || ''}
                              onChange={e => setNewProject({...newProject, link: e.target.value})}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="flex-1 py-2 bg-orange-500 text-black font-bold rounded-lg text-xs uppercase tracking-widest">Deploy</button>
                            <button type="button" onClick={() => setIsAddingProject(false)} className="px-4 py-2 border border-white/10 rounded-lg text-xs uppercase tracking-widest">Cancel</button>
                          </div>
                        </motion.form>
                      )}
                    </div>
                  )}

                  {projects.length === 0 && !isAdmin && (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-50">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                        <Code2 size={20} className="text-zinc-600" />
                      </div>
                      <span className="text-xs font-mono uppercase text-zinc-600">No Projects Deployed Yet...</span>
                    </div>
                  )}
                </div>
              </Section>

              <Section id="about" title={lang === 'en' ? "User Profile" : "Perfil de Utilizador"} activeSection={activeSection}>
                <div className="space-y-6">
                  <p>
                    {siteConfig[lang].profileText}
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-mono text-sm uppercase border-b border-white/5 pb-2">{lang === 'en' ? 'Technical Stack' : 'Stack Técnica'}</h4>
                    <div className="flex flex-wrap gap-2">
                      {siteConfig.technicalSkills.map(skill => (
                        <span key={skill.name} className="px-3 py-1 bg-zinc-800 border border-white/5 rounded-full text-xs text-zinc-400 font-mono">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-mono text-sm uppercase border-b border-white/5 pb-2">{lang === 'en' ? 'Languages' : 'Idiomas'}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {siteConfig.languages.map(l => (
                        <div key={l.name} className="text-center">
                          <div className="text-white font-bold">{l.name}</div>
                          <div className="text-[10px] text-zinc-500 uppercase">{l.level}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={onDownloadCV}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    >
                      <Download size={18} />
                      {lang === 'en' ? 'Download CV' : 'Descarregar CV'}
                    </button>
                  </div>
                </div>
              </Section>

              <Section id="contact" title={lang === 'en' ? "Establish Connection" : "Estabelecer Ligação"} activeSection={activeSection}>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {/* Honeypot field - hidden from users */}
                  <div className="hidden" aria-hidden="true">
                    <input 
                      type="text" 
                      name="website" 
                      tabIndex={-1} 
                      autoComplete="off"
                      value={contactForm.honeypot}
                      onChange={e => setContactForm({...contactForm, honeypot: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-500 ml-1">{lang === 'en' ? 'Name' : 'Nome'}</label>
                      <input 
                        required
                        type="text" 
                        value={contactForm.name}
                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-colors text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-zinc-500 ml-1">Email</label>
                      <input 
                        required
                        type="email" 
                        value={contactForm.email}
                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-colors text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-zinc-500 ml-1">{lang === 'en' ? 'Message' : 'Mensagem'}</label>
                    <textarea 
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={e => setContactForm({...contactForm, message: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-colors text-white resize-none"
                      placeholder={lang === 'en' ? "Type your message here..." : "Escreva a sua mensagem aqui..."}
                    />
                  </div>
                  
                  <button 
                    disabled={isSubmitting}
                    className={`w-full py-4 font-bold rounded-xl transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${
                      submitStatus === 'success' 
                        ? 'bg-green-500 text-white' 
                        : submitStatus === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : submitStatus === 'success' ? (
                      lang === 'en' ? 'Message Sent!' : 'Mensagem Enviada!'
                    ) : submitStatus === 'error' ? (
                      lang === 'en' ? 'Failed to Send' : 'Falha ao Enviar'
                    ) : (
                      lang === 'en' ? 'Send Message' : 'Enviar Mensagem'
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-6">
                  <a href="https://github.com/ClumsyNoodlester" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
                    <Github size={24} />
                  </a>
                  <a href="https://www.linkedin.com/in/dankachkyy/" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
                    <Linkedin size={24} />
                  </a>
                </div>
              </Section>

              <button 
                onClick={() => setActiveSection('home')}
                className="mt-8 text-zinc-500 hover:text-orange-400 font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
              >
                <ChevronRight size={14} className="rotate-180" />
                Return to Terminal
              </button>
            </div>
          )}
        </AnimatePresence>

      </main>

      {/* Modals */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-mono font-bold text-white uppercase mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-orange-500" />
                Edit Project
              </h2>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Title</label>
                  <input 
                    required
                    value={editingProject.title || ''}
                    onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Description</label>
                  <textarea 
                    required
                    value={editingProject.description || ''}
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                    rows={4}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Tags (comma separated)</label>
                  <input 
                    required
                    value={(Array.isArray(editingProject.tags) ? editingProject.tags.join(', ') : editingProject.tags) || ''}
                    onChange={e => setEditingProject({...editingProject, tags: e.target.value as unknown as string[]})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">Link</label>
                  <input 
                    value={editingProject.link || ''}
                    onChange={e => setEditingProject({...editingProject, link: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-3 bg-orange-500 text-black font-bold rounded-xl text-xs uppercase tracking-widest">Save Changes</button>
                  <button type="button" onClick={() => setEditingProject(null)} className="px-6 py-3 border border-white/10 rounded-xl text-xs uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isEditingConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                  <h2 className="text-xl font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Edit3 size={20} className="text-orange-500" />
                    Edit Site Content
                  </h2>
                  <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                    {['en', 'pt'].map(l => (
                      <button 
                        key={l}
                        type="button"
                        onClick={() => setEditLang(l as 'en' | 'pt')}
                        className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded transition-all ${editLang === l ? 'bg-orange-500 text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {l === 'en' ? 'English' : 'Português'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6 flex-shrink-0 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'basic', label: 'Basic', icon: UserIcon },
                    { id: 'contacts', label: 'Contacts', icon: Phone },
                    { id: 'intro', label: 'Intro Cards', icon: Cpu },
                    { id: 'experience', label: 'Experience', icon: Briefcase },
                    { id: 'education', label: 'Education', icon: GraduationCap },
                    { id: 'certs', label: 'Certs', icon: Award },
                    { id: 'skills', label: 'Skills', icon: Cpu },
                    { id: 'languages', label: 'Langs', icon: Globe },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setConfigTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                        configTab === tab.id 
                          ? 'border-orange-500 text-orange-500 bg-orange-500/5' 
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleUpdateConfig} className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                  {configTab === 'basic' && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-500">Full Name ({editLang.toUpperCase()})</label>
                        <input 
                          required
                          value={configForm[editLang].fullName || ''}
                          onChange={e => setConfigForm({
                            ...configForm,
                            [editLang]: { ...configForm[editLang], fullName: e.target.value }
                          })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-zinc-500">Job Title ({editLang.toUpperCase()})</label>
                          <input 
                            required
                            value={configForm[editLang].jobTitle || ''}
                            onChange={e => setConfigForm({
                              ...configForm,
                              [editLang]: { ...configForm[editLang], jobTitle: e.target.value }
                            })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-zinc-500">Status Line ({editLang.toUpperCase()})</label>
                          <input 
                            required
                            value={configForm[editLang].statusLine || ''}
                            onChange={e => setConfigForm({
                              ...configForm,
                              [editLang]: { ...configForm[editLang], statusLine: e.target.value }
                            })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-500">Profile Image</label>
                        <div className="flex gap-2">
                          <input 
                            value={configForm.profileImage || ''}
                            onChange={e => setConfigForm({...configForm, profileImage: e.target.value})}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                            placeholder="Image URL"
                          />
                          <label className="cursor-pointer px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-[10px] font-mono uppercase hover:bg-zinc-700 transition-colors flex items-center gap-2">
                            {isUploading ? 'Uploading...' : 'Upload'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-500">Intro Text ({editLang.toUpperCase()})</label>
                        <textarea 
                          value={configForm[editLang].introText || ''}
                          onChange={e => setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], introText: e.target.value } })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-500">Bio ({editLang.toUpperCase()})</label>
                        <textarea 
                          value={configForm[editLang].bio || ''}
                          onChange={e => setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], bio: e.target.value } })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-500">Profile Text ({editLang.toUpperCase()})</label>
                        <textarea 
                          value={configForm[editLang].profileText || ''}
                          onChange={e => setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], profileText: e.target.value } })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-zinc-500">About Me ({editLang.toUpperCase()})</label>
                        <textarea 
                          value={configForm[editLang].aboutMe || ''}
                          onChange={e => setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], aboutMe: e.target.value } })}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {configTab === 'contacts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(configForm.contacts).map((key) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-zinc-500">{key}</label>
                          <input 
                            value={(configForm.contacts as any)[key] || ''}
                            onChange={e => setConfigForm({
                              ...configForm,
                              contacts: { ...configForm.contacts, [key]: e.target.value }
                            })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-orange-500/50 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {configTab === 'intro' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {(configForm[editLang].introCards || []).map((card, idx) => (
                          <div key={idx} className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-4 relative">
                            <button 
                              type="button" 
                              onClick={() => setConfigForm({
                                ...configForm,
                                [editLang]: {
                                  ...configForm[editLang],
                                  introCards: configForm[editLang].introCards.filter((_, i) => i !== idx)
                                }
                              })}
                              className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase text-zinc-500">Title</label>
                                <input 
                                  value={card.title}
                                  onChange={e => {
                                    const newCards = [...configForm[editLang].introCards];
                                    newCards[idx].title = e.target.value;
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], introCards: newCards } });
                                  }}
                                  className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase text-zinc-500">Icon</label>
                                <select 
                                  value={card.icon}
                                  onChange={e => {
                                    const newCards = [...configForm[editLang].introCards];
                                    newCards[idx].icon = e.target.value;
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], introCards: newCards } });
                                  }}
                                  className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none"
                                >
                                  {['Cpu', 'Terminal', 'Shield', 'UserIcon', 'Briefcase', 'Code2', 'Globe', 'Star', 'GraduationCap', 'Award', 'BookOpen', 'Mail', 'Github', 'Linkedin'].map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono uppercase text-zinc-500">Description</label>
                              <textarea 
                                value={card.description}
                                onChange={e => {
                                  const newCards = [...configForm[editLang].introCards];
                                  newCards[idx].description = e.target.value;
                                  setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], introCards: newCards } });
                                }}
                                className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none resize-none"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setConfigForm({
                          ...configForm,
                          [editLang]: {
                            ...configForm[editLang],
                            introCards: [...configForm[editLang].introCards, { title: '', description: '', icon: 'Cpu' }]
                          }
                        })}
                        className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Card
                      </button>
                    </div>
                  )}

                  {configTab === 'experience' && (
                    <div className="space-y-6">
                      {configForm[editLang].experiences.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => setConfigForm({
                              ...configForm,
                              [editLang]: { ...configForm[editLang], experiences: configForm[editLang].experiences.filter((_, i) => i !== idx) }
                            })}
                            className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              placeholder="Title"
                              value={exp.title}
                              onChange={e => {
                                const newExps = [...configForm[editLang].experiences];
                                newExps[idx].title = e.target.value;
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: newExps } });
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                            />
                            <input 
                              placeholder="Company"
                              value={exp.company}
                              onChange={e => {
                                const newExps = [...configForm[editLang].experiences];
                                newExps[idx].company = e.target.value;
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: newExps } });
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                            />
                          </div>
                          <input 
                            placeholder="Period"
                            value={exp.period}
                            onChange={e => {
                              const newExps = [...configForm[editLang].experiences];
                              newExps[idx].period = e.target.value;
                               setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: newExps } });
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                          />
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase text-zinc-500">Points</label>
                            {exp.points.map((point, pIdx) => (
                              <div key={pIdx} className="flex gap-2">
                                <input 
                                  value={point}
                                  onChange={e => {
                                    const newExps = [...configForm[editLang].experiences];
                                    newExps[idx].points[pIdx] = e.target.value;
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: newExps } });
                                  }}
                                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newExps = [...configForm[editLang].experiences];
                                    newExps[idx].points = newExps[idx].points.filter((_, i) => i !== pIdx);
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: newExps } });
                                  }}
                                  className="text-zinc-600 hover:text-red-500"
                                >
                                  <Plus size={14} className="rotate-45" />
                                </button>
                              </div>
                            ))}
                            <button 
                              type="button"
                              onClick={() => {
                                const newExps = [...configForm[editLang].experiences];
                                newExps[idx].points.push('');
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: newExps } });
                              }}
                              className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1"
                            >
                              <Plus size={12} /> Add Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const newExp = { title: '', company: '', period: '', points: [''] };
                          setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], experiences: [...configForm[editLang].experiences, newExp] } });
                        }}
                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase"
                      >
                        <Plus size={16} /> Add Experience
                      </button>
                    </div>
                  )}

                  {configTab === 'education' && (
                    <div className="space-y-6">
                      {configForm[editLang].education.map((edu, idx) => (
                        <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => setConfigForm({
                              ...configForm,
                              [editLang]: { ...configForm[editLang], education: configForm[editLang].education.filter((_, i) => i !== idx) }
                            })}
                            className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={e => {
                                const newEdu = [...configForm[editLang].education];
                                newEdu[idx].degree = e.target.value;
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: newEdu } });
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                            />
                            <input 
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={e => {
                                const newEdu = [...configForm[editLang].education];
                                newEdu[idx].institution = e.target.value;
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: newEdu } });
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                            />
                          </div>
                          <input 
                            placeholder="Period"
                            value={edu.period}
                            onChange={e => {
                              const newEdu = [...configForm[editLang].education];
                              newEdu[idx].period = e.target.value;
                              setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: newEdu } });
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                          />
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase text-zinc-500">Points</label>
                            {edu.points.map((point, pIdx) => (
                              <div key={pIdx} className="flex gap-2">
                                <input 
                                  value={point}
                                  onChange={e => {
                                    const newEdu = [...configForm[editLang].education];
                                    newEdu[idx].points[pIdx] = e.target.value;
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: newEdu } });
                                  }}
                                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newEdu = [...configForm[editLang].education];
                                    newEdu[idx].points = newEdu[idx].points.filter((_, i) => i !== pIdx);
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: newEdu } });
                                  }}
                                  className="text-zinc-600 hover:text-red-500"
                                >
                                  <Plus size={14} className="rotate-45" />
                                </button>
                              </div>
                            ))}
                            <button 
                              type="button"
                              onClick={() => {
                                const newEdu = [...configForm[editLang].education];
                                newEdu[idx].points.push('');
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: newEdu } });
                              }}
                              className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1"
                            >
                              <Plus size={12} /> Add Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const newEdu = { degree: '', institution: '', period: '', points: [''] };
                          setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], education: [...configForm[editLang].education, newEdu] } });
                        }}
                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase"
                      >
                        <Plus size={16} /> Add Education
                      </button>
                    </div>
                  )}

                  {configTab === 'certs' && (
                    <div className="space-y-6">
                      {configForm[editLang].certifications.map((cert, idx) => (
                        <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4 relative group">
                          <button 
                            type="button"
                            onClick={() => setConfigForm({
                              ...configForm,
                              [editLang]: { ...configForm[editLang], certifications: configForm[editLang].certifications.filter((_, i) => i !== idx) }
                            })}
                            className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              placeholder="Title"
                              value={cert.title}
                              onChange={e => {
                                const newCerts = [...configForm[editLang].certifications];
                                newCerts[idx].title = e.target.value;
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: newCerts } });
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                            />
                            <input 
                              placeholder="Subtitle"
                              value={cert.subtitle}
                              onChange={e => {
                                const newCerts = [...configForm[editLang].certifications];
                                newCerts[idx].subtitle = e.target.value;
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: newCerts } });
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                            />
                          </div>
                          <input 
                            placeholder="Period"
                            value={cert.period}
                            onChange={e => {
                              const newCerts = [...configForm[editLang].certifications];
                              newCerts[idx].period = e.target.value;
                              setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: newCerts } });
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                          />
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase text-zinc-500">Points</label>
                            {cert.points.map((point, pIdx) => (
                              <div key={pIdx} className="flex gap-2">
                                <input 
                                  value={point}
                                  onChange={e => {
                                    const newCerts = [...configForm[editLang].certifications];
                                    newCerts[idx].points[pIdx] = e.target.value;
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: newCerts } });
                                  }}
                                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                                />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newCerts = [...configForm[editLang].certifications];
                                    newCerts[idx].points = newCerts[idx].points.filter((_, i) => i !== pIdx);
                                    setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: newCerts } });
                                  }}
                                  className="text-zinc-600 hover:text-red-500"
                                >
                                  <Plus size={14} className="rotate-45" />
                                </button>
                              </div>
                            ))}
                            <button 
                              type="button"
                              onClick={() => {
                                const newCerts = [...configForm[editLang].certifications];
                                newCerts[idx].points.push('');
                                setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: newCerts } });
                              }}
                              className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1"
                            >
                              <Plus size={12} /> Add Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const newCert = { title: '', subtitle: '', period: '', points: [''] };
                          setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], certifications: [...configForm[editLang].certifications, newCert] } });
                        }}
                        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase"
                      >
                        <Plus size={16} /> Add Certification
                      </button>
                    </div>
                  )}

                  {configTab === 'skills' && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase text-zinc-400 border-b border-white/5 pb-2">Technical Skills</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {configForm.technicalSkills.map((skill, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                              <input 
                                placeholder="Name"
                                value={skill.name}
                                onChange={e => {
                                  const newSkills = [...configForm.technicalSkills];
                                  newSkills[idx].name = e.target.value;
                                  setConfigForm({ ...configForm, technicalSkills: newSkills });
                                }}
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-orange-500/50"
                              />
                              <select 
                                value={skill.level}
                                onChange={e => {
                                  const newSkills = [...configForm.technicalSkills];
                                  newSkills[idx].level = parseInt(e.target.value);
                                  setConfigForm({ ...configForm, technicalSkills: newSkills });
                                }}
                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-orange-500/50 text-white"
                              >
                                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                              </select>
                              <button type="button" onClick={() => setConfigForm({ ...configForm, technicalSkills: configForm.technicalSkills.filter((_, i) => i !== idx) })} className="text-zinc-600 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => setConfigForm({ ...configForm, technicalSkills: [...configForm.technicalSkills, { name: '', level: 3 }] })} className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1">
                          <Plus size={12} /> Add Tech Skill
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase text-zinc-400 border-b border-white/5 pb-2">Personal Skills ({editLang.toUpperCase()})</h3>
                        <div className="space-y-4">
                          {configForm[editLang].personalSkills.map((skill, idx) => (
                            <div key={idx} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-2 relative">
                              <button type="button" onClick={() => setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], personalSkills: configForm[editLang].personalSkills.filter((_, i) => i !== idx) } })} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                              <input 
                                placeholder="Skill Name"
                                value={skill.name}
                                onChange={e => {
                                  const newSkills = [...configForm[editLang].personalSkills];
                                  newSkills[idx].name = e.target.value;
                                  setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], personalSkills: newSkills } });
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                              />
                              <textarea 
                                placeholder="Description"
                                value={skill.description}
                                onChange={e => {
                                  const newSkills = [...configForm[editLang].personalSkills];
                                  newSkills[idx].description = e.target.value;
                                  setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], personalSkills: newSkills } });
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-500/50 resize-none"
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => setConfigForm({ ...configForm, [editLang]: { ...configForm[editLang], personalSkills: [...configForm[editLang].personalSkills, { name: '', description: '' }] } })} className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1">
                          <Plus size={12} /> Add Personal Skill
                        </button>
                      </div>
                    </div>
                  )}

                  {configTab === 'languages' && (
                    <div className="space-y-4">
                      {configForm.languages.map((lang, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                          <input 
                            placeholder="Language Name"
                            value={lang.name}
                            onChange={e => {
                              const newLangs = [...configForm.languages];
                              newLangs[idx].name = e.target.value;
                              setConfigForm({ ...configForm, languages: newLangs });
                            }}
                            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                          />
                          <input 
                            placeholder="Level (e.g. Native)"
                            value={lang.level}
                            onChange={e => {
                              const newLangs = [...configForm.languages];
                              newLangs[idx].level = e.target.value;
                              setConfigForm({ ...configForm, languages: newLangs });
                            }}
                            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs outline-none focus:border-orange-500/50"
                          />
                          <button type="button" onClick={() => setConfigForm({ ...configForm, languages: configForm.languages.filter((_, i) => i !== idx) })} className="text-zinc-600 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setConfigForm({ ...configForm, languages: [...configForm.languages, { name: '', level: '' }] })} className="text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 flex items-center gap-1">
                        <Plus size={12} /> Add Language
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6 flex-shrink-0 border-t border-white/10">
                    <button type="button" onClick={() => setIsEditingConfig(false)} className="flex-1 py-3 bg-zinc-800 border border-white/10 rounded-xl text-sm font-mono uppercase tracking-widest hover:bg-zinc-700 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-orange-500 text-black rounded-xl text-sm font-mono font-bold uppercase tracking-widest hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">Save Changes</button>
                  </div>
                </form>
            </motion.div>
          </div>
        )}

        {isViewingMessages && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-3xl bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Mail size={20} className="text-orange-500" />
                  Contact Messages
                </h2>
                <button 
                  onClick={() => setIsViewingMessages(false)}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                    <Mail size={40} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-500 font-mono text-sm">No messages received yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="p-6 bg-black/40 border border-white/5 rounded-2xl group relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-white font-bold">{msg.name}</h3>
                          <p className="text-orange-500 text-xs font-mono">{msg.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-zinc-600 uppercase">
                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : 'Just now'}
                          </span>
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-2 text-red-500/30 hover:text-red-500 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 left-6 z-20 hidden md:block">
        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          &copy; 2026 Daniil Kachkovskyy // Lisbon, PT
        </div>
      </footer>
      
      <div className="fixed bottom-6 right-6 z-20 hidden md:block">
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          System Online
        </div>
      </div>
    </div>
    </>
  );
}
