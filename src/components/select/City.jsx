// src/components/select/City.jsx
import React, { useEffect, useState } from "react";
import SelectReactSelect from "@/components/form/SelectReactSelect";
import { t } from "i18next";

const City = ({ value, setValue }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL || "/api"}/cities`
        );
        const data = await response.json();
        if (cancelled) return;
        const list = (data.result?.records || []).sort((a, b) =>
          (a.city_name_he || "").localeCompare(b.city_name_he || "", "he")
        );
        setCities(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const options = cities.map((city) => ({
    value: city,
    label: city.city_name_he || "",
  }));

  const selectValue =
    value != null && value.city_name_he
      ? { value, label: value.city_name_he }
      : null;

  const handleChange = (option) => {
    setValue(option?.value ?? null);
  };

  return (
    <SelectReactSelect
      placeholder={t("selectCity")}
      options={options}
      value={selectValue}
      onChange={handleChange}
      images={false}
      isSearchable={true}
      isLoading={loading}
    />
  );
};

export default City;