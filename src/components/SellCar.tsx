import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBuilding,
  faStore,
  faCheckCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { carService } from "../services/carService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type { CarResponse } from "../types/types"; // Removed Car, User

const SellCar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { user, token } = useAuth();
  const initialStep = id || user?.seller_type ? 2 : 1;
  const [step, setStep] = useState(initialStep);
  const [sellerType, setSellerType] = useState<
    "individual" | "corporate" | "showroom" | null
  >(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [colour, setColour] = useState("");
  const [yearOfManufacture, setYearOfManufacture] = useState("");
  const [mileage, setMileage] = useState("");
  const [mileageUnit, setMileageUnit] = useState<"KM" | "Miles">("KM");
  const [hasAccidentHistory, setHasAccidentHistory] = useState<"Yes" | "No">(
    "No"
  );
  const [askingPrice, setAskingPrice] = useState("");
  const [location, setLocation] = useState("");
  const [transmissionType, setTransmissionType] = useState<
    "Automatic" | "Manual" | ""
  >("");
  const [propulsion, setPropulsion] = useState<
    "Gas" | "Electric" | "Hybrid" | ""
  >("");
  const [fuelType, setFuelType] = useState<"Petrol" | "Diesel" | "">("");
  const [condition, setCondition] = useState<
    "Brand New" | "Foreign Used" | "Locally Used" | ""
  >("");
  const [acceleration, setAcceleration] = useState("");
  const [consumptionRate, setConsumptionRate] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [listingType, setListingType] = useState<
    "sale" | "auction" | "hire" | ""
  >("");
  const [importStatus, setImportStatus] = useState("");
  const [priceTax, setPriceTax] = useState("");
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  const [auctionEndDate, setAuctionEndDate] = useState("");
  const transmissionOptions: ("Automatic" | "Manual")[] = [
    "Automatic",
    "Manual",
  ];
  const propulsionOptions: ("Gas" | "Electric" | "Hybrid")[] = [
    "Gas",
    "Electric",
    "Hybrid",
  ];
  const fuelTypeOptions: ("Petrol" | "Diesel")[] = ["Petrol", "Diesel"];
  const conditionOptions: ("Brand New" | "Foreign Used" | "Locally Used")[] = [
    "Brand New",
    "Foreign Used",
    "Locally Used",
  ];
  const listingTypeOptions: ("sale" | "auction" | "hire")[] = [
    "sale",
    "hire",
    "auction",
  ];
  const hasSubmittedRef = useRef(false);
  const hasFetchedCarRef = useRef(false);

  useEffect(() => {
    if (user?.seller_type) {
      const validSellerType = ["individual", "corporate", "showroom"].includes(
        user.seller_type
      )
        ? (user.seller_type as "individual" | "corporate" | "showroom")
        : null;
      setSellerType(validSellerType);
      setStep(2);
    } else if (!id) {
      setStep(1);
    }
  }, [user, id]);

  useEffect(() => {
    if (id && token && !hasFetchedCarRef.current) {
      hasFetchedCarRef.current = true;
      setIsLoading(true);
      carService
        .getCarById(Number(id))
        .then((res: CarResponse) => {
          if (res.status === "success" && res.data?.car) {
            const car = res.data.car;
            setBrand(car.brand || "");
            setModel(car.model || "");
            setRegistrationNumber(car.registration_number || "");
            setColour(car.colour || "");
            setYearOfManufacture(car.year_of_manufacture?.toString() || "");
            setMileage(car.mileage?.toString() || "");
            setMileageUnit((car.mileage_unit as "KM" | "Miles") || "KM");
            setHasAccidentHistory(car.has_accident_history ? "Yes" : "No");
            setAskingPrice(car.asking_price || "");
            setLocation(car.location || "");
            setTransmissionType(
              (car.transmission_type as "Automatic" | "Manual" | "") || ""
            );
            setPropulsion(
              (car.propulsion as "Gas" | "Electric" | "Hybrid" | "") || ""
            );
            setFuelType((car.fuel_type as "Petrol" | "Diesel" | "") || "");
            setCondition(
              (car.condition as
                | "Brand New"
                | "Foreign Used"
                | "Locally Used"
                | "") || ""
            );
            setAcceleration(car.acceleration || "");
            setConsumptionRate(car.consumption_rate || "");
            setFeaturesList(car.features || []);
            setListingType(
              (car.listing_type as "sale" | "auction" | "hire") || ""
            );
            setImportStatus(car.import_status || "");
            setPriceTax(car.price_tax || "");
            setCurrency((car.currency as "KES" | "USD") || "KES");
            setExistingImages(car.images || []);
            setAuctionEndDate(
              car.auction_end_time
                ? new Date(car.auction_end_time).toISOString().slice(0, 16)
                : ""
            );
          } else {
            toast.error(res.message || "Failed to load car details");
          }
        })
        .catch((error: unknown) => {
          let errorMessage = "Failed to load car details";
          if (error instanceof AxiosError && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          toast.error(errorMessage);
          if (error instanceof AxiosError && error.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
            navigate("/authentication");
          }
        })
        .finally(() => {
          setIsLoading(false);
          hasFetchedCarRef.current = false;
        });
    }
  }, [id, token, navigate]);

  const handleAuctionEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = e.target.value;
      const now = new Date();
      const selected = new Date(selectedDate);
      if (selected <= now) {
        toast.error("Auction end date must be in the future.");
        setAuctionEndDate("");
        return;
      }
      setAuctionEndDate(selectedDate);
    },
    []
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = Array.from(e.target.files).filter(
        (file) => file.type.startsWith("image/") && file.size < 5 * 1024 * 1024
      );
      const totalImages = images.length + existingImages.length + files.length;
      if (totalImages > 10) {
        toast.error("You can have up to 10 images total.");
        return;
      }
      setImages((prev) => [...prev, ...files]);
    },
    [images, existingImages]
  );

  const removeImage = useCallback(
    (index: number, isExisting: boolean = false) => {
      if (isExisting) {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
      } else {
        setImages((prev) => prev.filter((_, i) => i !== index));
      }
    },
    []
  );

  const handleAddFeature = useCallback(() => {
    if (featureInput.trim()) {
      setFeaturesList((prev) => [...prev, featureInput.trim()]);
      setFeatureInput("");
    }
  }, [featureInput]);

  const handleRemoveFeature = useCallback((index: number) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);
  const prevStep = useCallback(
    () =>
      setStep((prev) =>
        prev === 2 && !id && !user?.seller_type ? 1 : prev - 1
      ),
    [id, user]
  );
  const selectSellerType = useCallback(
    (type: "individual" | "corporate" | "showroom") => {
      setSellerType(type);
      nextStep();
    },
    [nextStep]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (hasSubmittedRef.current || !token) return;
      hasSubmittedRef.current = true;
      setIsLoading(true);
      const totalImages = images.length + existingImages.length;
      if (
        !brand ||
        !model ||
        !registrationNumber ||
        !colour ||
        !yearOfManufacture ||
        !mileage ||
        !askingPrice ||
        !location ||
        totalImages < 8 ||
        (listingType === "auction" && !auctionEndDate)
      ) {
        toast.error(
          "Please fill all required fields, ensure at least 8 images, and provide an auction end date if listing type is auction."
        );
        hasSubmittedRef.current = false;
        setIsLoading(false);
        return;
      }
      if (!/^[A-Z0-9-]+$/.test(registrationNumber)) {
        toast.error("Invalid registration number format");
        hasSubmittedRef.current = false;
        setIsLoading(false);
        return;
      }
      if (!/^\d+(\.\d{1,2})?$/.test(askingPrice)) {
        toast.error("Invalid asking price format (e.g., 10000 or 10000.00)");
        hasSubmittedRef.current = false;
        setIsLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("brand", brand);
      formData.append("model", model);
      formData.append("registration_number", registrationNumber);
      formData.append("colour", colour);
      formData.append("year_of_manufacture", yearOfManufacture);
      formData.append("mileage", mileage);
      formData.append("mileage_unit", mileageUnit);
      formData.append(
        "has_accident_history",
        hasAccidentHistory === "Yes" ? "true" : "false"
      );
      formData.append("asking_price", askingPrice);
      formData.append("location", location);
      if (transmissionType)
        formData.append("transmission_type", transmissionType);
      if (propulsion) formData.append("propulsion", propulsion);
      if (fuelType) formData.append("fuel_type", fuelType);
      if (condition) formData.append("condition", condition);
      if (acceleration) formData.append("acceleration", acceleration);
      if (consumptionRate) formData.append("consumption_rate", consumptionRate);
      if (featuresList.length > 0) {
        formData.append("features", featuresList.join(","));
      }
      formData.append("listing_type", listingType);
      if (importStatus) formData.append("import_status", importStatus);
      if (priceTax) formData.append("price_tax", priceTax);
      formData.append("currency", currency);
      if (listingType === "auction" && auctionEndDate) {
        formData.append(
          "auction_end_time",
          new Date(auctionEndDate).toISOString()
        );
      }
      if (sellerType) {
        formData.append("seller_type", sellerType);
      }
      if (
        user?.showroom_corporate &&
        typeof user.showroom_corporate.id === "number" &&
        (sellerType === "showroom" || sellerType === "corporate")
      ) {
        formData.append("showroom_id", user.showroom_corporate.id.toString());
      }
      images.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });
      existingImages.forEach((url) => {
        formData.append("existing_images[]", url);
      });
      try {
        id
          ? await carService.updateCar(token, Number(id), formData)
          : await carService.createCar(token, formData);
        toast.success(
          id ? "Car updated successfully!" : "Car listing created successfully!"
        );
        setIsSubmitted(true);
        setTimeout(() => navigate("/user?tab=myCars"), 2000);
      } catch (error: unknown) {
        let errorMessage = "Failed to save car listing";
        if (error instanceof AxiosError && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
        hasSubmittedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    },
    [
      token,
      id,
      brand,
      model,
      registrationNumber,
      colour,
      yearOfManufacture,
      mileage,
      mileageUnit,
      hasAccidentHistory,
      askingPrice,
      location,
      transmissionType,
      propulsion,
      fuelType,
      condition,
      acceleration,
      consumptionRate,
      featuresList,
      listingType,
      importStatus,
      priceTax,
      currency,
      auctionEndDate,
      sellerType,
      user,
      images,
      existingImages,
      navigate,
    ]
  );

  const handleModalDismiss = useCallback(() => {
    setIsSubmitted(false);
    navigate("/user?tab=myCars");
  }, [navigate]);

  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  }, []);

  if (!user && !id) {
    navigate("/authentication");
    return null;
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}
      <section className="px-6 md:px-16 lg:px-24 py-12">
        <div className="gap-6">
          <div className="md:col-span-2 bg-white p-6 shadow rounded-lg">
            {step === 1 && !id && !user?.seller_type && (
              <div>
                <h2 className="text-2xl text-[#262162] font-bold">
                  Select Seller Type
                </h2>
                <p className="text-[#262162]">
                  Choose how you want to list your vehicle
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {["individual", "corporate", "showroom"].map((type) => (
                    <div
                      key={type}
                      onClick={() =>
                        selectSellerType(
                          type as "individual" | "corporate" | "showroom"
                        )
                      }
                      className={`border p-4 rounded-lg cursor-pointer ${
                        sellerType === type
                          ? "border-[#f26624] bg-orange-50"
                          : "border-[#262162]"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={
                          type === "individual"
                            ? faUser
                            : type === "corporate"
                            ? faBuilding
                            : faStore
                        }
                        className="text-2xl text-[#f26624] mb-2"
                      />
                      <h3 className="text-lg text-[#262162] font-semibold">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </h3>
                      <p className="text-sm text-[#262162]">
                        {type === "individual"
                          ? "Selling your personal vehicle"
                          : type === "corporate"
                          ? "Selling company-owned vehicles"
                          : "Dealership or professional car seller"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-2xl text-[#f26624] font-bold">
                  {id ? "Update Car Details" : "Car Details"}
                </h2>
                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Registration Number:{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      className="border p-3 w-full rounded-lg mt-1"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Make: <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="text"
                        className="border p-3 w-full rounded-lg mt-1"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g., Toyota"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Model: <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="text"
                        className="border p-3 w-full rounded-lg mt-1"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., Corolla"
                        required
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Colour: <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      className="border p-3 w-full rounded-lg mt-1"
                      value={colour}
                      onChange={(e) => setColour(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Year of Manufacture:{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="border p-3 w-full rounded-lg mt-1"
                      value={yearOfManufacture}
                      onChange={(e) => setYearOfManufacture(e.target.value)}
                      required
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Mileage: <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="number"
                        className="border p-3 w-full rounded-lg mt-1"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Mileage Unit: <span className="text-red-500">*</span>
                      </span>
                      <select
                        className="border p-3 w-full rounded-lg mt-1"
                        value={mileageUnit}
                        onChange={(e) =>
                          setMileageUnit(e.target.value as "KM" | "Miles")
                        }
                        required
                      >
                        <option value="KM">KM</option>
                        <option value="Miles">Miles</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Has Accident History:{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="border p-3 w-full rounded-lg mt-1"
                      value={hasAccidentHistory}
                      onChange={(e) =>
                        setHasAccidentHistory(e.target.value as "Yes" | "No")
                      }
                      required
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Asking Price: <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      className="border p-3 w-full rounded-lg mt-1"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Location: <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      className="border p-3 w-full rounded-lg mt-1"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Listing Type:
                      </span>
                      <select
                        className="border p-3 w-full rounded-lg mt-1"
                        value={listingType}
                        onChange={(e) => {
                          setListingType(
                            e.target.value as "sale" | "auction" | "hire" | ""
                          );
                          if (e.target.value !== "auction") {
                            setAuctionEndDate("");
                          }
                        }}
                      >
                        <option value="">Select Listing Type</option>
                        {listingTypeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {listingType === "auction" && (
                      <label className="block">
                        <span className="text-[#262162] font-semibold">
                          Auction End Date:{" "}
                          <span className="text-red-500">*</span>
                        </span>
                        <input
                          type="datetime-local"
                          className="border p-3 w-full rounded-lg mt-1"
                          value={auctionEndDate}
                          onChange={handleAuctionEndDateChange}
                          min={new Date().toISOString().slice(0, 16)}
                          required
                        />
                      </label>
                    )}
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Import Status:
                      </span>
                      <select
                        className="border p-3 w-full rounded-lg mt-1"
                        value={importStatus}
                        onChange={(e) => setImportStatus(e.target.value)}
                      >
                        <option value="">Select Import Status</option>
                        <option value="Direct Import">Direct Import</option>
                        <option value="Local">Local</option>
                        <option value="Both">Both</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Price Tax:
                      </span>
                      <select
                        className="border p-3 w-full rounded-lg mt-1"
                        value={priceTax}
                        onChange={(e) => setPriceTax(e.target.value)}
                      >
                        <option value="">Select Price Tax</option>
                        <option value="Tax Included">Tax Included</option>
                        <option value="Tax Excluded">Tax Excluded</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[#262162] font-semibold">
                        Currency:
                      </span>
                      <select
                        className="border p-3 w-full rounded-lg mt-1"
                        value={currency}
                        onChange={(e) =>
                          setCurrency(e.target.value as "KES" | "USD")
                        }
                      >
                        <option value="">Select Currency</option>
                        <option value="KES">KES</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Transmission Type:
                    </span>
                    <select
                      className="border p-3 w-full rounded-lg mt-3"
                      value={transmissionType}
                      onChange={(e) =>
                        setTransmissionType(
                          e.target.value as "Automatic" | "Manual" | ""
                        )
                      }
                    >
                      <option value="">Select Transmission Type</option>
                      {transmissionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Propulsion:
                    </span>
                    <select
                      className="border p-3 w-full rounded-lg mt-1"
                      value={propulsion}
                      onChange={(e) =>
                        setPropulsion(
                          e.target.value as "Gas" | "Electric" | "Hybrid" | ""
                        )
                      }
                    >
                      <option value="">Select Propulsion</option>
                      {propulsionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Fuel Type:
                    </span>
                    <select
                      className="border p-3 w-full rounded-lg mt-1"
                      value={fuelType}
                      onChange={(e) =>
                        setFuelType(e.target.value as "Petrol" | "Diesel" | "")
                      }
                    >
                      <option value="">Select Fuel Type</option>
                      {fuelTypeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Condition:
                    </span>
                    <select
                      className="border p-3 w-full rounded-lg mt-1"
                      value={condition}
                      onChange={(e) =>
                        setCondition(
                          e.target.value as
                            | "Brand New"
                            | "Foreign Used"
                            | "Locally Used"
                            | ""
                        )
                      }
                    >
                      <option value="">Select Condition</option>
                      {conditionOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Acceleration:
                    </span>
                    <input
                      type="text"
                      className="border p-3 w-full rounded-lg mt-1"
                      value={acceleration}
                      onChange={(e) => setAcceleration(e.target.value)}
                      placeholder="e.g., 0-100 in 3.3 secs"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Consumption Rate:
                    </span>
                    <input
                      type="text"
                      className="border p-3 w-full rounded-lg mt-1"
                      value={consumptionRate}
                      onChange={(e) => setConsumptionRate(e.target.value)}
                      placeholder="e.g., 24 litres/100km"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Features:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="border p-3 w-full rounded-lg mt-1"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="e.g., 2000cc, LCD display"
                      />
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-1"
                        onClick={handleAddFeature}
                      >
                        Add
                      </button>
                    </div>
                    {featuresList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {featuresList.map((feat, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1"
                          >
                            <span className="text-sm">{feat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(idx)}
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="text-xs"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </label>
                  <label className="block">
                    <span className="text-[#262162] font-semibold">
                      Upload Images (8-10):{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="border p-3 w-full rounded-lg mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {images.length + existingImages.length} images selected
                    </p>
                  </label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative">
                        {failedImages.has(index) ? (
                          <img
                            src="/placeholder.png"
                            alt={`Placeholder ${index}`}
                            width={80}
                            height={80}
                            className="object-cover rounded"
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Existing ${index}`}
                            width={80}
                            height={80}
                            className="object-cover rounded"
                            onError={() => handleImageError(index)}
                          />
                        )}
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          onClick={() => removeImage(index, true)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {images.map((image, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index}`}
                          width={80}
                          height={80}
                          className="object-cover rounded"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6">
                    {(step > 1 || (!id && !user?.seller_type)) && (
                      <button
                        type="button"
                        className="bg-[#262162] text-white px-6 py-3 rounded-lg hover:bg-[#f26624]"
                        onClick={prevStep}
                      >
                        Previous
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`bg-[#f26624] text-white px-6 py-3 rounded-lg hover:bg-[#262162] ${
                        images.length + existingImages.length < 8 ||
                        (listingType === "auction" && !auctionEndDate)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={
                        images.length + existingImages.length < 8 ||
                        (listingType === "auction" && !auctionEndDate)
                      }
                    >
                      {id ? "Update Car" : "Submit Car"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      {isSubmitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-4xl text-orange-500 mb-4"
            />
            <h2 className="text-xl font-bold mb-2">
              Car Listing {id ? "Updated" : "Submitted"} Successfully
            </h2>
            <p className="text-sm">Your car is awaiting approval.</p>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleModalDismiss}
            >
              View My Cars
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SellCar;
