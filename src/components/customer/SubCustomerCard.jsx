// src/components/customer/SubCustomerCard.jsx
// כרטיס שדות תת-לקוח. מקבל prefix כדי לתמוך בשני מצבים:
//   - prefix="primaryDetails" - כשרוצים להציג את שדות התת-לקוח המוסתר כשדות של הלקוח הראשי
//   - prefix={`subCustomers.${idx}`} - כשרוצים להציג כרטיס תת-לקוח גלוי רגיל
import React from "react";
import { Select } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { BiMap } from "react-icons/bi";

import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import Error from "@/components/form/others/Error";
import ProfileImageUploader from "@/components/image-uploader/ProfileImageUploader";
import City from "@/components/select/City";

// קבלת שגיאת שדה לפי נתיב מקונן (למשל "primaryDetails.address.street")
const getError = (errors, path) => {
    if (!errors || !path) return undefined;
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), errors);
};

const SubCustomerCard = ({
    prefix,
    register,
    errors,
    watch,
    setValue,
    isNewCustomer,
    customerType,
    hideNameEmailPhone = false,
    hideImage = false,
}) => {
    const { t } = useTranslation();

    const addressCity = watch(`${prefix}.address.city`);

    return (
        <div className="flex xl:flex-row flex-col gap-4 md:gap-10 md:items-start">
            {/* תמונת תת-לקוח */}
            {!hideImage && (
                <div className="flex justify-center">
                    <ProfileImageUploader
                        imageUrl={watch(`${prefix}.image`)}
                        setImageUrl={(url) =>
                            setValue(`${prefix}.image`, url, { shouldDirty: true })
                        }
                        folder="shovrimshok customers"
                        size="medium"
                    />
                </div>
            )}

            {/* שדות תת-לקוח */}
            <div className="w-full space-y-6">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* שם פרטי / משפחה / אימייל / טלפון - מוסתרים במצב primary (כי כבר על הלקוח הראשי) */}
                    {!hideNameEmailPhone && (
                        <>
                            <div className="flex flex-col">
                                <LabelArea label={t("Name")} />
                                <InputArea
                                    register={register}
                                    label={t("Name")}
                                    name={`${prefix}.name`}
                                    type="text"
                                    placeholder={t("CustomerNamePlaceholder")}
                                    isRequired={true}
                                    autocomplete={isNewCustomer ? "off" : undefined}
                                />
                                <Error errorName={getError(errors, `${prefix}.name`)} />
                            </div>

                            <div className="flex flex-col">
                                <LabelArea label={t("Last Name")} />
                                <InputArea
                                    register={register}
                                    label={t("Last Name")}
                                    name={`${prefix}.lastName`}
                                    type="text"
                                    placeholder={t("CustomerLastNamePlaceholder")}
                                    isRequired={false}
                                    autocomplete={isNewCustomer ? "off" : undefined}
                                />
                                <Error errorName={getError(errors, `${prefix}.lastName`)} />
                            </div>

                            <div className="flex flex-col">
                                <LabelArea label={t("Email")} />
                                <InputArea
                                    register={register}
                                    label={t("Email")}
                                    name={`${prefix}.email`}
                                    type="email"
                                    placeholder={t("CustomerEmailPlaceholder")}
                                    isRequired={true}
                                    autocomplete={isNewCustomer ? "section-new-customer email" : undefined}
                                />
                                <Error errorName={getError(errors, `${prefix}.email`)} />
                            </div>

                            <div className="flex flex-col">
                                <LabelArea label={t("Phone")} />
                                <InputArea
                                    register={register}
                                    label={t("Phone")}
                                    name={`${prefix}.phone`}
                                    type="tel"
                                    placeholder={t("CustomerPhonePlaceholder")}
                                    isRequired={false}
                                    autocomplete={isNewCustomer ? "off" : undefined}
                                />
                                <Error errorName={getError(errors, `${prefix}.phone`)} />
                            </div>
                        </>
                    )}

                    {/* תקופת התראה */}
                    <div className="flex flex-col">
                        <LabelArea label={t("AlertPeriod")} />
                        <Select {...register(`${prefix}.alertPeriod`)}>
                            <option value="" disabled hidden>{t("AlertPeriodPlaceholder")}</option>
                            <option value="weekly">{t("Weekly")}</option>
                            <option value="monthly">{t("Monthly")}</option>
                        </Select>
                        <Error errorName={getError(errors, `${prefix}.alertPeriod`)} />
                    </div>

                    {/* סכום להתראה */}
                    <div className="flex flex-col">
                        <LabelArea label={t("AlertAmount")} />
                        <InputArea
                            register={register}
                            label={t("AlertAmount")}
                            name={`${prefix}.alertAmount`}
                            type="number"
                            min={0}
                            placeholder="1000"
                            isRequired={false}
                            autocomplete={isNewCustomer ? "off" : undefined}
                        />
                        <Error errorName={getError(errors, `${prefix}.alertAmount`)} />
                    </div>

                    {/* מסגרת אשראי */}
                    {customerType !== "casual" && (
                        <div className="flex flex-col">
                            <LabelArea label={t("CreditLimit")} />
                            <InputArea
                                register={register}
                                label={t("CreditLimit")}
                                name={`${prefix}.creditLimit`}
                                type="number"
                                min={0}
                                placeholder={t("CreditLimitPlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.creditLimit`)} />
                        </div>
                    )}

                    {/* מספר לקוח בריווחית */}
                    <div className="flex flex-col">
                        <LabelArea label={t("RivhitCustomerNumber") || "Rivhit customer number"} />
                        <InputArea
                            register={register}
                            label={t("RivhitCustomerNumber") || "Rivhit customer number"}
                            name={`${prefix}.rivhitCustomerNumber`}
                            type="text"
                            placeholder="12345"
                            isRequired={false}
                            autocomplete={isNewCustomer ? "off" : undefined}
                        />
                        <Error errorName={getError(errors, `${prefix}.rivhitCustomerNumber`)} />
                    </div>

                    {/* סיסמה (אופציונלי/חדשה) */}
                    <div className="flex flex-col">
                        <LabelArea label={isNewCustomer ? t("PasswordOptional") : t("NewPassword")} />
                        <InputArea
                            register={register}
                            label={isNewCustomer ? t("PasswordOptional") : t("NewPassword")}
                            name={`${prefix}.newPassword`}
                            type="password"
                            placeholder={isNewCustomer ? t("NewPasswordPlaceholderCreate") : t("NewPasswordPlaceholderUpdate")}
                            isRequired={false}
                            autocomplete="section-new-customer new-password"
                        />
                        <Error errorName={getError(errors, `${prefix}.newPassword`)} />
                    </div>

                    {/* יום משלוח שבועי */}
                    <div className="flex flex-col">
                        <LabelArea label={t("WeeklyDeliveryDay")} />
                        <Select {...register(`${prefix}.weeklyDeliveryDay`)}>
                            <option value="">{t("WeeklyDeliveryDayPlaceholder")}</option>
                            <option value="0">{t("DaySunday")}</option>
                            <option value="1">{t("DayMonday")}</option>
                            <option value="2">{t("DayTuesday")}</option>
                            <option value="3">{t("DayWednesday")}</option>
                            <option value="4">{t("DayThursday")}</option>
                            <option value="5">{t("DayFriday")}</option>
                            <option value="6">{t("DaySaturday")}</option>
                        </Select>
                        <Error errorName={getError(errors, `${prefix}.weeklyDeliveryDay`)} />
                    </div>
                </div>

                {/* כתובת מלאה */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <BiMap size={22} className="text-mainColor" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t("FullAddress")}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div className="flex flex-col">
                            <LabelArea label={t("City")} />
                            <City
                                value={addressCity}
                                setValue={(val) =>
                                    setValue(`${prefix}.address.city`, val, { shouldDirty: true })
                                }
                            />
                        </div>
                        <div className="flex flex-col">
                            <LabelArea label={t("Street")} />
                            <InputArea
                                register={register}
                                label={t("Street")}
                                name={`${prefix}.address.street`}
                                type="text"
                                placeholder={t("StreetPlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.address.street`)} />
                        </div>
                        <div className="flex flex-col">
                            <LabelArea label={t("HouseNumber")} />
                            <InputArea
                                register={register}
                                label={t("HouseNumber")}
                                name={`${prefix}.address.houseNumber`}
                                type="text"
                                placeholder={t("HouseNumberPlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.address.houseNumber`)} />
                        </div>
                        <div className="flex flex-col">
                            <LabelArea label={t("ApartmentNumber")} />
                            <InputArea
                                register={register}
                                label={t("ApartmentNumber")}
                                name={`${prefix}.address.apartmentNumber`}
                                type="text"
                                placeholder={t("ApartmentNumberPlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.address.apartmentNumber`)} />
                        </div>
                        <div className="flex flex-col">
                            <LabelArea label={t("Floor")} />
                            <InputArea
                                register={register}
                                label={t("Floor")}
                                name={`${prefix}.address.floor`}
                                type="text"
                                placeholder={t("FloorPlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.address.floor`)} />
                        </div>
                        <div className="flex flex-col">
                            <LabelArea label={t("EntryCode")} />
                            <InputArea
                                register={register}
                                label={t("EntryCode")}
                                name={`${prefix}.address.entryCode`}
                                type="text"
                                placeholder={t("EntryCodePlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.address.entryCode`)} />
                        </div>
                        <div className="flex flex-col">
                            <LabelArea label={t("PostalCode")} />
                            <InputArea
                                register={register}
                                label={t("PostalCode")}
                                name={`${prefix}.address.postalCode`}
                                type="text"
                                placeholder={t("PostalCodePlaceholder")}
                                isRequired={false}
                                autocomplete={isNewCustomer ? "off" : undefined}
                            />
                            <Error errorName={getError(errors, `${prefix}.address.postalCode`)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubCustomerCard;
