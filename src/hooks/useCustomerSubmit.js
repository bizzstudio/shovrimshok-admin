// src/hooks/useCustomerSubmit.js
import { useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Internal import
import { SidebarContext } from "@/context/SidebarContext";
import CustomerServices from "@/services/CustomerServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const emptyAddress = {
  city: null,
  street: "",
  houseNumber: "",
  apartmentNumber: "",
  floor: "",
  entryCode: "",
  postalCode: "",
};

// מבנה ריק לתת-לקוח גלוי (לכפתור "הוסף תת-לקוח")
const createEmptySubCustomer = () => ({
  _id: undefined,
  name: "",
  lastName: "",
  email: "",
  phone: "",
  image: "",
  creditLimit: 0,
  weeklyDeliveryDay: "",
  rivhitCustomerNumber: "",
  newPassword: "",
  alertAmount: "",
  alertPeriod: "",
  address: { ...emptyAddress },
});

// מבנה ריק ל-primaryDetails (השדות שמוצגים על "הלקוח הראשי" כשאין תתי-לקוחות גלויים)
const createEmptyPrimaryDetails = () => ({
  _id: undefined,
  image: "",
  creditLimit: 0,
  weeklyDeliveryDay: "",
  rivhitCustomerNumber: "",
  newPassword: "",
  alertAmount: "",
  alertPeriod: "",
  address: { ...emptyAddress },
});

// המרת Customer (מהשרת) למבנה תואם טופס - משמש גם ל-primary וגם ל-sub-customers
const customerToFormShape = (sc) => ({
  _id: sc?._id,
  name: sc?.name || "",
  lastName: sc?.lastName || "",
  email: sc?.email || "",
  phone: sc?.phone || "",
  image: sc?.image || "",
  creditLimit: sc?.creditLimit || 0,
  weeklyDeliveryDay:
    sc?.weeklyDeliveryDay !== undefined && sc?.weeklyDeliveryDay !== null
      ? String(sc.weeklyDeliveryDay)
      : "",
  rivhitCustomerNumber: sc?.accounting?.externalCustomerId
    ? String(sc.accounting.externalCustomerId)
    : "",
  newPassword: "",
  alertAmount: sc?.alertAmount != null ? String(sc.alertAmount) : "",
  alertPeriod: sc?.alertPeriod || "",
  address:
    sc?.address && typeof sc.address === "object"
      ? {
        city: sc.address.city || null,
        street: sc.address.street || "",
        houseNumber: sc.address.houseNumber || "",
        apartmentNumber: sc.address.apartmentNumber || "",
        floor: sc.address.floor || "",
        entryCode: sc.address.entryCode || "",
        postalCode: sc.address.postalCode || "",
      }
      : { ...emptyAddress },
});

// בניית payload אחיד מנתוני טופס (משמש גם ל-primaryDetails וגם לתתי-לקוחות גלויים)
const buildCustomerPayload = (formData, { includeNameEmail }) => {
  const address =
    formData.address && typeof formData.address === "object"
      ? {
        city: formData.address.city || undefined,
        street: formData.address.street || undefined,
        houseNumber: formData.address.houseNumber || undefined,
        apartmentNumber: formData.address.apartmentNumber || undefined,
        floor: formData.address.floor || undefined,
        entryCode: formData.address.entryCode || undefined,
        postalCode: formData.address.postalCode || undefined,
      }
      : {};

  const payload = {
    ...(formData._id ? { _id: formData._id } : {}),
    image: formData.image || "",
    address,
    creditLimit: Number(formData.creditLimit || 0),
    weeklyDeliveryDay:
      formData.weeklyDeliveryDay !== "" && formData.weeklyDeliveryDay !== undefined && formData.weeklyDeliveryDay !== null
        ? Number(formData.weeklyDeliveryDay)
        : undefined,
    alertAmount: formData.alertAmount !== "" && formData.alertAmount != null ? Number(formData.alertAmount) : null,
    alertPeriod: ["weekly", "monthly"].includes(formData.alertPeriod) ? formData.alertPeriod : null,
  };

  if (includeNameEmail) {
    payload.name = formData.name;
    payload.lastName = formData.lastName || "";
    payload.email = String(formData.email).toLowerCase();
    payload.phone = formData.phone || "";
  }

  if (formData.newPassword && String(formData.newPassword).trim()) {
    payload.password = formData.newPassword;
  }

  // תמיד שולחים externalCustomerId (מספר או null) - כדי שהשרת יוכל לנקות ערך קיים
  const rivhitTrimmed = formData.rivhitCustomerNumber != null ? String(formData.rivhitCustomerNumber).trim() : "";
  payload.externalCustomerId = rivhitTrimmed ? Number(rivhitTrimmed) : null;

  return payload;
};

const useCustomerSubmit = (customerId, customer) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setIsUpdate, priceLists } = useContext(SidebarContext);

  const isNewCustomer = !customerId;

  // מציאת מחירון ברירת מחדל (isDefault: true)
  const getDefaultPriceListId = () => {
    if (priceLists && priceLists.length > 0) {
      const defaultPriceList = priceLists.find((pl) => pl.isDefault === true);
      return defaultPriceList ? defaultPriceList._id : null;
    }
    return null;
  };

  const getDefaultPriceList = (mainCustomerPriceList) => {
    if (mainCustomerPriceList) {
      return mainCustomerPriceList._id || mainCustomerPriceList;
    }
    return getDefaultPriceListId();
  };

  // הפרדה של תתי-לקוחות לקבוצות: primary (יחיד, מוסתר) ו-visible (השאר)
  const splitSubCustomers = (allSubCustomers) => {
    const list = Array.isArray(allSubCustomers) ? allSubCustomers : [];
    const primary = list.find((sc) => sc?.isPrimary) || null;
    const visible = list.filter((sc) => !sc?.isPrimary);
    return { primary, visible };
  };

  const getDefaultValues = () => {
    if (customer) {
      // עדיפות ל-primarySubCustomer שמוחזר במפורש מהשרת; fallback לחיפוש בתוך subCustomers
      const primaryFromServer = customer.primarySubCustomer || splitSubCustomers(customer.subCustomers).primary;
      const visibleSubCustomers = splitSubCustomers(customer.subCustomers).visible.map(customerToFormShape);

      return {
        // MainCustomer fields
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        customerType: "institutional",
        companyNumber: customer.companyNumber || "",
        institutionType: customer.institutionType || "",
        priceList: getDefaultPriceList(customer.priceList),
        paymentTerms: customer.paymentTerms || "current",
        mainRivhitCustomerNumber: customer.externalCustomerId
          ? String(customer.externalCustomerId)
          : "",

        // התת-לקוח המוסתר (שדותיו מוצגים כשדות של הלקוח הראשי)
        primaryDetails: primaryFromServer
          ? customerToFormShape(primaryFromServer)
          : createEmptyPrimaryDetails(),

        // תתי-לקוחות גלויים בלבד
        subCustomers: visibleSubCustomers,
      };
    }

    return {
      name: "",
      email: "",
      phone: "",
      customerType: "institutional",
      companyNumber: "",
      institutionType: "",
      priceList: getDefaultPriceListId(),
      paymentTerms: "current",
      mainRivhitCustomerNumber: "",
      primaryDetails: createEmptyPrimaryDetails(),
      subCustomers: [],
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: getDefaultValues(),
  });

  const { fields: subCustomerFields, append, remove } = useFieldArray({
    control,
    name: "subCustomers",
  });

  const customerType = watch("customerType");
  const currentPriceList = watch("priceList");

  const isBusinessOrInstitutional = useMemo(
    () => customerType === "business" || customerType === "institutional",
    [customerType]
  );

  const hasVisibleSubCustomers = subCustomerFields.length > 0;

  // סוג לקוח קבוע: מוסדי – בחירת מחירון ברירת מחדל
  useEffect(() => {
    if (priceLists && priceLists.length > 0 && (!currentPriceList || currentPriceList === null)) {
      const defaultPriceListId = getDefaultPriceListId();
      if (defaultPriceListId) {
        setValue("priceList", defaultPriceListId, { shouldDirty: false });
      }
    }
  }, [priceLists, currentPriceList, setValue]);

  // טעינת נתונים ראשוניים
  useEffect(() => {
    if (customer) {
      reset(getDefaultValues());
    } else if (isNewCustomer) {
      reset(getDefaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, reset, isNewCustomer, priceLists]);

  const hasChanges = isNewCustomer ? true : isDirty;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      data.customerType = data.customerType || "institutional";

      // מחירון
      let finalPriceList = data.priceList;
      if (data.customerType !== "casual" && (!finalPriceList || finalPriceList === null)) {
        const defaultPriceListId = getDefaultPriceListId();
        if (defaultPriceListId) {
          finalPriceList = defaultPriceListId;
        }
      } else if (data.customerType === "casual") {
        finalPriceList = null;
      }

      // primaryDetails - תמיד נשלח (גם כשיש תתי-לקוחות גלויים, כדי שלא נאבד את פרטיו הקיימים).
      // ה-backend מתעלם מ-name/email/phone של primary - מסונכרנים אוטומטית עם MainCustomer.
      const primaryDetailsPayload = buildCustomerPayload(data.primaryDetails || {}, { includeNameEmail: false });

      // תתי-לקוחות גלויים בלבד
      const subCustomersToSend = Array.isArray(data.subCustomers)
        ? data.subCustomers
          .filter((sc) => sc && sc.name && sc.email)
          .map((sc) => buildCustomerPayload(sc, { includeNameEmail: true }))
        : [];

      const mainCustomerData = {
        name: data.name,
        email: String(data.email).toLowerCase(),
        phone: data.phone || "",
        customerType: data.customerType,
        companyNumber: data.companyNumber || "",
        priceList: finalPriceList,
        paymentTerms: data.paymentTerms,
        institutionType: data.institutionType || undefined,
        primaryDetails: primaryDetailsPayload,
        subCustomers: subCustomersToSend,
      };

      // מספר לקוח בריווחית ללקוח ראשי – שדה ברמת השורש (externalCustomerId)
      const mainRivhitValue = data.mainRivhitCustomerNumber != null && String(data.mainRivhitCustomerNumber).trim();
      if (mainRivhitValue) {
        mainCustomerData.externalCustomerId = Number(String(data.mainRivhitCustomerNumber).trim());
      } else if (!isNewCustomer) {
        mainCustomerData.externalCustomerId = "";
      }

      if (isNewCustomer) {
        const res = await CustomerServices.createCustomerByAdmin(mainCustomerData);
        notifySuccess(res.message?.he || res.message || t("CustomerCreatedSuccessfully"));
        if (res.mainCustomer?._id) {
          window.location.href = `/customer/${res.mainCustomer._id}`;
        } else {
          window.location.href = `/customers`;
        }
      } else {
        const res = await CustomerServices.updateCustomerByAdmin(customerId, mainCustomerData);
        notifySuccess(res.message?.he || res.message || t("CustomerUpdatedSuccessfully"));
        reset(getDefaultValues());
        setIsUpdate(true);
      }
    } catch (err) {
      notifyError(
        err?.response?.data?.message?.he ||
        err?.response?.data?.message ||
        err?.message ||
        t("UpdateFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const appendSubCustomer = () => append(createEmptySubCustomer());
  const removeSubCustomer = (index) => remove(index);

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setValue,
    watch,
    isSubmitting,
    hasChanges,
    customerType,
    isNewCustomer,

    // Sub customers helpers
    subCustomerFields,
    appendSubCustomer,
    removeSubCustomer,
    isBusinessOrInstitutional,
    hasVisibleSubCustomers,
  };
};

export default useCustomerSubmit;
