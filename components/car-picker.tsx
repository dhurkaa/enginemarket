"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { CarCatalogue } from "@/lib/stock";

/**
 * Make → model → year → fuel. A plain GET form to /engines, so it works without script; the script
 * only narrows each list to what the one before it allows.
 */
export function CarPicker({ catalogue, idPrefix = "car" }: { catalogue: CarCatalogue; idPrefix?: string }) {
  const t = useTranslations("engines");
  const th = useTranslations("home");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const models = useMemo(() => catalogue.find((c) => c.make === make)?.models ?? [], [catalogue, make]);
  const years = useMemo(() => models.find((m) => m.model === model)?.years ?? [], [models, model]);
  const id = (s: string) => `${idPrefix}-${s}`;
  return (
    <form className="car-picker" action="/engines" method="get">
      <div className="car-picker__fields">
        <div className="field">
          <label htmlFor={id("make")}>{t("make")}</label>
          <select
            id={id("make")}
            name="make"
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
              setYear("");
            }}
          >
            <option value="">{t("anyMake")}</option>
            {catalogue.map((c) => (
              <option key={c.make} value={c.make}>
                {c.make}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id("model")}>{t("model")}</label>
          <select
            id={id("model")}
            name="model"
            value={model}
            disabled={!make}
            onChange={(e) => {
              setModel(e.target.value);
              setYear("");
            }}
          >
            <option value="">{t("anyModel")}</option>
            {models.map((m) => (
              <option key={m.model} value={m.model}>
                {m.model}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id("year")}>{t("year")}</label>
          <select id={id("year")} name="year" value={year} disabled={!model} onChange={(e) => setYear(e.target.value)}>
            <option value="">{t("anyYear")}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id("fuel")}>{t("fuel")}</label>
          <select id={id("fuel")} name="fuel" defaultValue="">
            <option value="">{t("anyFuel")}</option>
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
          </select>
        </div>
      </div>
      <div className="btn-row">
        <button className="btn btn--secondary" type="submit">
          {th("carButton")}
        </button>
      </div>
    </form>
  );
}
