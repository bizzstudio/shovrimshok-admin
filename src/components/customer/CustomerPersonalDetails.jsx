// src/components/customer/CustomerPersonalDetails.jsx
import React, { useContext } from "react";
import { Card, CardBody, Button, Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiSolidUserDetail } from "react-icons/bi";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";

// Internal import
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import SubCustomerCard from "@/components/customer/SubCustomerCard";
import useCustomerSubmit from "@/hooks/useCustomerSubmit";
import { SidebarContext } from "@/context/SidebarContext";

const CustomerPersonalDetails = ({ customer, customerId }) => {
    const { t } = useTranslation();
    const { priceLists } = useContext(SidebarContext);

    const {
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
        subCustomerFields,
        appendSubCustomer,
        removeSubCustomer,
        isBusinessOrInstitutional,
        hasVisibleSubCustomers,
    } = useCustomerSubmit(customerId, customer);

    return (
        <div className="my-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody className="p-6">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        autoComplete={isNewCustomer ? "off" : undefined}
                    >
                        <div className="space-y-6">

                            {/* כותרת פרטים אישיים */}
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <BiSolidUserDetail size={24} className="text-mainColor" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {t("PersonalDetails")}
                                </h2>
                            </div>

                            {/* רשת שדות: שם, אימייל, טלפון, סוג לקוח ועוד */}
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* שם */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("Name")} />
                                    <InputArea
                                        register={register}
                                        label={t("Name")}
                                        name="name"
                                        type="text"
                                        placeholder={t("CustomerNamePlaceholder")}
                                        isRequired={true}
                                        autocomplete={isNewCustomer ? "off" : undefined}
                                    />
                                    <Error errorName={errors.name} />
                                </div>

                                {/* אימייל */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("Email")} />
                                    <InputArea
                                        register={register}
                                        label={t("Email")}
                                        name="email"
                                        type="email"
                                        placeholder={t("CustomerEmailPlaceholder")}
                                        isRequired={true}
                                        autocomplete={isNewCustomer ? "section-new-customer email" : undefined}
                                    />
                                    <Error errorName={errors.email} />
                                </div>

                                {/* טלפון */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("Phone")} />
                                    <InputArea
                                        register={register}
                                        label={t("Phone")}
                                        name="phone"
                                        type="tel"
                                        placeholder={t("CustomerPhonePlaceholder")}
                                        isRequired={false}
                                        autocomplete={isNewCustomer ? "off" : undefined}
                                    />
                                    <Error errorName={errors.phone} />
                                </div>

                                {/* סוג לקוח */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("CustomerType")} />
                                    <Select
                                        {...register("customerType", {
                                            required: `${t("CustomerType")} ${t("isRequired")}!`,
                                        })}
                                    >
                                        <option value="casual">{t("CasualCustomer")}</option>
                                        <option value="regular">{t("RegularCustomer")}</option>
                                        <option value="business">{t("BusinessCustomer")}</option>
                                        <option value="institutional">{t("InstitutionalCustomer")}</option>
                                    </Select>
                                    <Error errorName={errors.customerType} />
                                </div>

                                {/* מספר עוסק (עסקי/מוסדי) */}
                                {(customerType === "business" || customerType === "institutional") && (
                                    <div className="flex flex-col">
                                        <LabelArea label={t("CompanyNumber")} />
                                        <InputArea
                                            register={register}
                                            label={t("CompanyNumber")}
                                            name="companyNumber"
                                            type="text"
                                            placeholder={t("CompanyNumberPlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.companyNumber} />
                                    </div>
                                )}

                                {/* סוג מוסד (מוסדי בלבד) */}
                                {customerType === "institutional" && (
                                    <div className="flex flex-col">
                                        <LabelArea label={t("InstitutionType")} />
                                        <InputArea
                                            register={register}
                                            label={t("InstitutionType")}
                                            name="institutionType"
                                            type="text"
                                            placeholder={t("InstitutionTypePlaceholder")}
                                            isRequired={false}
                                            autocomplete={isNewCustomer ? "off" : undefined}
                                        />
                                        <Error errorName={errors.institutionType} />
                                    </div>
                                )}

                                {/* מחירון */}
                                {customerType !== "casual" && priceLists && priceLists.length > 0 && (
                                    <div className="flex flex-col">
                                        <LabelArea label={t("PriceList")} />
                                        <Select {...register("priceList")}>
                                            {priceLists.map((priceList) => (
                                                <option key={priceList._id} value={priceList._id}>
                                                    {priceList.name}
                                                </option>
                                            ))}
                                        </Select>
                                        <Error errorName={errors.priceList} />
                                    </div>
                                )}

                                {/* תנאי תשלום */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("PaymentTerms")} />
                                    <Select
                                        {...register("paymentTerms", {
                                            required: `${t("PaymentTerms")} ${t("isRequired")}!`,
                                        })}
                                    >
                                        <option value="current">{t("Current")}</option>
                                        <option value="+15">{t("Plus15Days")}</option>
                                        <option value="+30">{t("Plus30Days")}</option>
                                        <option value="+45">{t("Plus45Days")}</option>
                                        <option value="+60">{t("Plus60Days")}</option>
                                        <option value="+90">{t("Plus90Days")}</option>
                                        <option value="noDueDate">{t("NoDueDate")}</option>
                                    </Select>
                                    <Error errorName={errors.paymentTerms} />
                                </div>

                                {/* מספר לקוח בריווחית (לקוח ראשי) */}
                                <div className="flex flex-col">
                                    <LabelArea label={t("RivhitCustomerNumber") || "Rivhit customer number"} />
                                    <InputArea
                                        register={register}
                                        label={t("RivhitCustomerNumber") || "Rivhit customer number"}
                                        name="mainRivhitCustomerNumber"
                                        type="text"
                                        placeholder="12345"
                                        isRequired={false}
                                        autocomplete={isNewCustomer ? "off" : undefined}
                                    />
                                    <Error errorName={errors.mainRivhitCustomerNumber} />
                                </div>
                            </div>

                            {/* שדות ה-primary (כתובת/אשראי/אזעקה/יום אספקה/סיסמה) - מוצגים כשדות של הלקוח הראשי
                                כשאין תתי-לקוחות גלויים. ברגע שמוסיפים תת-לקוח גלוי - השדות נעלמים מכאן. */}
                            {!hasVisibleSubCustomers && (
                                <div className="pt-2">
                                    <SubCustomerCard
                                        prefix="primaryDetails"
                                        register={register}
                                        errors={errors}
                                        watch={watch}
                                        setValue={setValue}
                                        isNewCustomer={isNewCustomer}
                                        customerType={customerType}
                                        hideNameEmailPhone={true}
                                        hideImage={true}
                                    />
                                </div>
                            )}

                            {/* סעיף תת-לקוחות גלויים */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <FiUsers size={22} className="text-mainColor" />
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {t("SubCustomers") || "Sub Customers"}
                                        </h2>
                                    </div>

                                    {isBusinessOrInstitutional && (
                                        <button
                                            type="button"
                                            onClick={appendSubCustomer}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-mainColor text-white hover:bg-mainColor/90 transition-colors cursor-pointer"
                                        >
                                            <FiPlus size={18} />
                                            <span className="text-sm font-medium">
                                                {t("AddSubCustomer") || "Add sub-customer"}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* רשימת כרטיסי תת-לקוח גלויים */}
                                <div className="space-y-4">
                                    {subCustomerFields.map((field, idx) => {
                                        const subName = watch(`subCustomers.${idx}.name`);
                                        const subLastName = watch(`subCustomers.${idx}.lastName`);
                                        const displayName = [subName, subLastName].filter(Boolean).join(" ").trim()
                                            || `${t("SubCustomer") || "Sub-customer"} #${idx + 1}`;

                                        return (
                                            <div
                                                key={field.id}
                                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {displayName}
                                                    </div>

                                                    {isBusinessOrInstitutional && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubCustomer(idx)}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                                        >
                                                            <FiTrash2 size={16} />
                                                            <span className="text-sm">
                                                                {t("Remove") || "Remove"}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>

                                                <SubCustomerCard
                                                    prefix={`subCustomers.${idx}`}
                                                    register={register}
                                                    errors={errors}
                                                    watch={watch}
                                                    setValue={setValue}
                                                    isNewCustomer={isNewCustomer}
                                                    customerType={customerType}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* כפתור שמירה / עדכון לקוח */}
                            {hasChanges && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting
                                            ? (isNewCustomer ? t("Creating") : t("Updating")) + "..."
                                            : isNewCustomer
                                                ? t("CreateCustomer")
                                                : t("UpdateCustomer")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomerPersonalDetails;
