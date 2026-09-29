/**
 * In-Network Provider Search — Component Library (React + Tailwind)
 * ------------------------------------------------------------------
 * 7 components ported from the vanilla prototype (v2):
 *   1. BrandRow          — branded response header with thumbs feedback
 *   2. SelectTile        — constrained single-select tile group
 *   3. ProviderCard      — Card 1: individual provider result
 *   4. FacilityCard      — Card 2: facility result w/ myCigna CTA
 *   5. FeedbackButtons   — Yes/No care-outcome check
 *   6. ListView          — N provider cards (stack / snap-scroll)
 *   7. MapView           — SVG map, numbered pins, anchored card
 * Plus: Results (List ⇄ Map toggle wrapper) and MOCK_DATA.
 *
 * Icons: @phosphor-icons/react
 * Styling: Tailwind utility classes only (no external CSS).
 */

import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Hospital,
  DotsThree,
} from "@phosphor-icons/react";

/* ============================================================
   Types — mirror the vanilla MOCK data objects exactly
   ============================================================ */

export interface PlanOption {
  id: string;
  label: string;
  /** Renders full-width (escape hatch tiles like "Not sure") */
  full?: boolean;
}

export interface Provider {
  id: number;
  category: string;
  name: string;
  address: string;
  distance: string;
  specialties: string;
  initials: string;
  /** Optional headshot; falls back to initials avatar */
  photoUrl?: string;
  /** Pin position on the map, as percentages */
  map: { x: number; y: number };
}

export interface Facility {
  index: number;
  name: string;
  addressLines: string[];
  phone: string;
  specialties: string;
  plans: string;
  distance: string;
}

export interface Brand {
  name: string;
  /** "blue-chip" renders the cigna chip; "neutral" the gray placeholder */
  logo?: "blue-chip" | "neutral";
}

/* ============================================================
   1. BrandRow
   ============================================================ */

export interface BrandRowProps {
  brand: Brand;
  onFeedback?: (helpful: boolean) => void;
}

export function BrandRow({ brand, onFeedback }: BrandRowProps) {
  const chip =
    brand.logo === "neutral" ? (
      <span className="h-[22px] w-[22px] rounded-md bg-neutral-500" />
    ) : (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#0033ff] text-[7px] font-extrabold text-white">
        cigna
      </span>
    );
  return (
    <div className="flex items-center gap-2">
      {chip}
      <span className="flex-1 text-[14.5px] font-bold text-neutral-600">
        {brand.name}
      </span>
      <span className="flex gap-2.5 text-neutral-600">
        <button
          aria-label="Helpful"
          onClick={() => onFeedback?.(true)}
          className="cursor-pointer"
        >
          <ThumbsUp size={16} />
        </button>
        <button
          aria-label="Not helpful"
          onClick={() => onFeedback?.(false)}
          className="cursor-pointer"
        >
          <ThumbsDown size={16} />
        </button>
      </span>
    </div>
  );
}

/* ============================================================
   2. SelectTile
   ============================================================ */

export interface SelectTileProps {
  prompt: string;
  category: string;
  options: PlanOption[];
  onSelect: (option: PlanOption) => void;
  /** Controlled selected id; omit for uncontrolled lock-on-select */
  value?: string;
}

export function SelectTile({
  prompt,
  category,
  options,
  onSelect,
  value,
}: SelectTileProps) {
  const [internal, setInternal] = useState<string | null>(null);
  const selected = value ?? internal;
  const locked = selected !== null && selected !== undefined;

  return (
    <div className="max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4.5 py-3.5 text-[13.5px] text-neutral-600">
        {prompt}
      </div>
      <div className="px-4.5 pb-4.5 pt-4">
        <div className="mb-3 text-[15px] font-extrabold">{category}</div>
        <div
          role="radiogroup"
          aria-label={category}
          className="grid grid-cols-2 gap-2.5"
        >
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                role="radio"
                aria-checked={isSelected}
                disabled={locked && !isSelected}
                onClick={() => {
                  if (locked) return;
                  setInternal(opt.id);
                  onSelect(opt);
                }}
                className={[
                  "flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-left text-[15px] font-extrabold transition-colors",
                  opt.full ? "col-span-full" : "",
                  locked ? "cursor-default" : "cursor-pointer hover:border-neutral-400",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "relative h-5 w-5 shrink-0 rounded-full border-[1.6px]",
                    isSelected ? "border-neutral-900" : "border-neutral-400",
                  ].join(" ")}
                >
                  {isSelected && (
                    <span className="absolute inset-1 rounded-full bg-neutral-900" />
                  )}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   3. ProviderCard
   ============================================================ */

export interface ProviderCardProps {
  provider: Provider;
  /** Header text; pass e.g. "1. Primary Care Provider" for map view */
  headerLabel?: string;
  showCategory?: boolean;
  onViewDetails?: (provider: Provider) => void;
}

export function ProviderCard({
  provider,
  headerLabel,
  showCategory = true,
  onViewDetails,
}: ProviderCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
      {showCategory && (
        <div className="border-b border-neutral-200 px-4 py-3 text-[13.5px] text-neutral-600">
          {headerLabel ?? provider.category}
        </div>
      )}
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3.5 gap-y-1 px-4 pb-1.5 pt-3.5">
        {provider.photoUrl ? (
          <img
            src={provider.photoUrl}
            alt=""
            className="row-span-2 h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <span className="row-span-2 flex h-11 w-11 items-center justify-center rounded-full bg-stone-400 text-[15px] font-extrabold text-white">
            {provider.initials}
          </span>
        )}
        <div className="min-w-0">
          <div className="text-[15.5px] font-extrabold">{provider.name}</div>
          <div className="truncate text-[13.5px] text-neutral-600">
            {provider.address}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3.5 px-4 pb-3 text-[13.5px] text-neutral-600">
        <span className="font-bold text-neutral-900">{provider.distance}</span>
        <span>Specialties: {provider.specialties}</span>
      </div>
      <div className="px-3.5 pb-3.5 pt-1">
        <button
          onClick={() => onViewDetails?.(provider)}
          className="w-full cursor-pointer rounded-full bg-neutral-900 px-4 py-3 text-[14.5px] font-extrabold text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          View provider details
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   4. FacilityCard
   ============================================================ */

export interface FacilityCardProps {
  facility: Facility;
  onViewPlans?: (facility: Facility) => void;
  onLogin?: (facility: Facility) => void;
  onOverflow?: (facility: Facility) => void;
}

export function FacilityCard({
  facility,
  onViewPlans,
  onLogin,
  onOverflow,
}: FacilityCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-[13.5px] text-neutral-600">
        <span>{facility.index}. Facility Name</span>
        <button
          aria-label="More options"
          onClick={() => onOverflow?.(facility)}
          className="cursor-pointer text-neutral-900"
        >
          <DotsThree size={20} weight="bold" />
        </button>
      </div>
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-3.5 px-4 pt-3.5">
        <span className="row-span-2 flex h-9 w-9 items-center justify-center text-neutral-900">
          <Hospital size={28} />
        </span>
        <div className="text-[13.5px] leading-relaxed text-neutral-600">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="font-extrabold text-neutral-900 underline underline-offset-2"
          >
            {facility.name}
          </a>
          {facility.addressLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>Phone: {facility.phone}</div>
          <div>Specialties: {facility.specialties}</div>
          <div>Plan: {facility.plans}</div>
        </div>
      </div>
      <div className="flex gap-3.5 px-4 pb-3 pt-1 text-[13.5px]">
        <span className="font-bold text-neutral-900">{facility.distance}</span>
        <button
          onClick={() => onViewPlans?.(facility)}
          className="cursor-pointer font-bold text-neutral-900 underline underline-offset-2"
        >
          View plans
        </button>
      </div>
      <div className="px-3.5 pb-3.5 pt-1">
        <button
          onClick={() => onLogin?.(facility)}
          className="w-full cursor-pointer rounded-full bg-neutral-900 px-4 py-3 text-[14.5px] font-extrabold text-white hover:bg-black"
        >
          Log in to myCigna
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   5. FeedbackButtons
   ============================================================ */

export interface FeedbackButtonsProps {
  question?: string;
  onAnswer?: (yes: boolean) => void;
}

export function FeedbackButtons({
  question = "Were you able to find the care you are looking for?",
  onAnswer,
}: FeedbackButtonsProps) {
  const [answered, setAnswered] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3.5 text-[14px]">
      <span>{question}</span>
      {answered ? (
        <em className="text-[13px] text-neutral-500">Thanks — noted.</em>
      ) : (
        <span className="flex gap-2">
          <button
            onClick={() => {
              setAnswered(true);
              onAnswer?.(true);
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-[13.5px] font-bold text-blue-700"
          >
            <ThumbsUp size={14} /> Yes
          </button>
          <button
            onClick={() => {
              setAnswered(true);
              onAnswer?.(false);
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-[13.5px] font-bold text-blue-700"
          >
            <ThumbsDown size={14} /> No
          </button>
        </span>
      )}
    </div>
  );
}

/* ============================================================
   6. ListView
   ============================================================ */

export interface ListViewProps {
  providers: Provider[];
  /** "stack" (mobile) or "row" (desktop snap-scroll). Default responsive. */
  layout?: "stack" | "row" | "responsive";
  onViewDetails?: (provider: Provider) => void;
}

export function ListView({
  providers,
  layout = "responsive",
  onViewDetails,
}: ListViewProps) {
  const rowClasses =
    "flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-1.5 [&>*]:w-80 [&>*]:shrink-0 [&>*]:snap-start";
  const stackClasses = "flex flex-col gap-3.5";
  const cls =
    layout === "row"
      ? rowClasses
      : layout === "stack"
        ? stackClasses
        : `${stackClasses} md:${"flex-row"} md:snap-x md:snap-mandatory md:flex-row md:overflow-x-auto md:pb-1.5 md:[&>*]:w-80 md:[&>*]:shrink-0 md:[&>*]:snap-start`;
  return (
    <div className={cls}>
      {providers.map((p) => (
        <ProviderCard key={p.id} provider={p} onViewDetails={onViewDetails} />
      ))}
    </div>
  );
}

/* ============================================================
   7. MapView
   ============================================================ */

export interface MapViewProps {
  providers: Provider[];
  height?: number;
  onViewDetails?: (provider: Provider) => void;
}

export function MapView({
  providers,
  height = 480,
  onViewDetails,
}: MapViewProps) {
  const [activeId, setActiveId] = useState<number>(providers[0]?.id);
  const active = providers.find((p) => p.id === activeId) ?? providers[0];

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-stone-200 shadow-sm"
      style={{ height }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="100" height="100" fill="#ecebe8" />
        <path
          d="M62 0 Q70 20 78 28 T 84 60 Q88 80 82 100 L100 100 L100 0 Z"
          fill="#cfe0ee"
        />
        <path
          d="M30 62 q6 -4 10 2 t 12 4 q4 4 -2 8 t -14 0 q-8 -6 -6 -14"
          fill="#d8e6d4"
        />
        <g stroke="#ffffff" strokeWidth="1.6" fill="none">
          <path d="M0 30 H70" />
          <path d="M0 55 H62" />
          <path d="M0 80 H70" />
          <path d="M22 0 V100" />
          <path d="M48 0 V100" />
          <path d="M0 10 Q40 14 70 40 T 100 78" />
        </g>
        <g stroke="#ffffff" strokeWidth="0.8" fill="none" opacity=".8">
          <path d="M10 0 V100" />
          <path d="M34 0 V100" />
          <path d="M0 42 H60" />
          <path d="M0 68 H55" />
        </g>
      </svg>

      <div className="absolute left-3 top-3 z-[3] flex flex-col rounded-lg bg-white shadow">
        <button aria-label="Zoom in" className="h-[30px] w-[30px] cursor-pointer border-b border-neutral-200">
          +
        </button>
        <button aria-label="Zoom out" className="h-[30px] w-[30px] cursor-pointer">
          −
        </button>
      </div>

      <span
        title="You are here"
        className="absolute left-1/2 top-[56%] z-[2] flex h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-neutral-900 bg-white after:h-2 after:w-2 after:rounded-full after:bg-neutral-900 after:content-['']"
      />

      {providers.map((p) => (
        <button
          key={p.id}
          aria-label={`Show ${p.name}`}
          onClick={() => setActiveId(p.id)}
          style={{ left: `${p.map.x}%`, top: `${p.map.y}%` }}
          className={[
            "absolute z-[2] flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white text-[13px] font-extrabold text-white shadow-md",
            p.id === activeId ? "bg-[#0033ff]" : "bg-neutral-900",
          ].join(" ")}
        >
          {p.id}
        </button>
      ))}

      {active && (
        <div className="absolute inset-x-3 bottom-3 z-[4] md:bottom-auto md:left-6 md:right-auto md:top-5 md:w-[56%]">
          <div className="shadow-xl">
            <ProviderCard
              provider={active}
              headerLabel={`${active.id}. ${active.category}`}
              onViewDetails={onViewDetails}
            />
          </div>
        </div>
      )}

      <span className="absolute bottom-0.5 right-1.5 z-[2] text-[9px] text-neutral-400">
        Map data © prototype
      </span>
    </div>
  );
}

/* ============================================================
   Results — List ⇄ Map toggle wrapper (composition of 6 + 7)
   ============================================================ */

export interface ResultsProps {
  providers: Provider[];
  onViewDetails?: (provider: Provider) => void;
}

export function Results({ providers, onViewDetails }: ResultsProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const tab = (v: "list" | "map", label: string) => (
    <button
      role="tab"
      aria-selected={view === v}
      onClick={() => setView(v)}
      className={[
        "cursor-pointer rounded-full px-4.5 py-2 text-[14px] font-bold",
        view === v ? "border border-neutral-900 bg-white" : "border border-transparent",
      ].join(" ")}
    >
      {label}
    </button>
  );
  return (
    <div className="max-w-[640px]">
      <div
        role="tablist"
        aria-label="Results view"
        className="mb-3 inline-flex rounded-full border border-neutral-200 bg-white p-[3px] shadow-sm"
      >
        {tab("list", "List view")}
        {tab("map", "Map view")}
      </div>
      {view === "list" ? (
        <ListView providers={providers} onViewDetails={onViewDetails} />
      ) : (
        <MapView providers={providers} onViewDetails={onViewDetails} />
      )}
    </div>
  );
}

/* ============================================================
   Mock content — identical values to the vanilla MOCK object
   ============================================================ */

export const MOCK_DATA: {
  brand: Brand;
  plans: PlanOption[];
  providers: Provider[];
  facility: Facility;
} = {
  brand: { name: "Cigna Healthcare", logo: "blue-chip" },
  plans: [
    { id: "localplus", label: "Local+" },
    { id: "oap", label: "OAP" },
    { id: "ppo", label: "PPO" },
    { id: "hmo", label: "HMO" },
    { id: "unsure", label: "Not sure / I don’t know", full: true },
  ],
  providers: [
    {
      id: 1,
      category: "Primary Care Provider",
      name: "Dr. Lisa Sanchez, MD",
      address: "460 Farmington, West Hartford, CT 06002",
      distance: "1.2 mi",
      specialties: "Primary Care, +2",
      initials: "LS",
      map: { x: 42, y: 52 },
    },
    {
      id: 2,
      category: "Primary Care Provider",
      name: "Dr. James Okafor, MD",
      address: "88 Main St, Bloomfield, CT 06002",
      distance: "2.1 mi",
      specialties: "Primary Care, Internal Medicine",
      initials: "JO",
      map: { x: 15, y: 70 },
    },
    {
      id: 3,
      category: "Primary Care Provider",
      name: "Dr. Priya Raman, DO",
      address: "1290 Blue Hills Ave, Hartford, CT 06112",
      distance: "3.4 mi",
      specialties: "Family Medicine, +1",
      initials: "PR",
      map: { x: 66, y: 24 },
    },
    {
      id: 4,
      category: "Primary Care Provider",
      name: "Dr. Ellen Cho, MD",
      address: "55 Park Rd, West Hartford, CT 06119",
      distance: "3.9 mi",
      specialties: "Primary Care",
      initials: "EC",
      map: { x: 20, y: 18 },
    },
    {
      id: 5,
      category: "Primary Care Provider",
      name: "Dr. Marcus Bell, MD",
      address: "705 North Main, Windsor, CT 06095",
      distance: "4.6 mi",
      specialties: "Primary Care, Geriatrics",
      initials: "MB",
      map: { x: 93, y: 45 },
    },
  ],
  facility: {
    index: 1,
    name: "Orthopedic Associates CT",
    addressLines: ["460 Farmington,", "West Hartford, CT 06002"],
    phone: "(860) 123-4567",
    specialties: "Primary Care, +2",
    plans: "Open Access Plus, PPO, +2",
    distance: "1.2 mi",
  },
};

const Components = {
  BrandRow,
  SelectTile,
  ProviderCard,
  FacilityCard,
  FeedbackButtons,
  ListView,
  MapView,
  Results,
};

export default Components;
