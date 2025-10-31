"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CompanyTab } from "@/components/founder/company-tab";
import { DocumentsTab } from "@/components/founder/documents-tab";
import { TeamTab } from "@/components/founder/team-tab";
import { ProductTab } from "@/components/founder/product-tab";
import { MarketTab } from "@/components/founder/market-tab";
import { TractionTab } from "@/components/founder/traction-tab";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { FormData, formSchema } from "@/lib/types";
import { Id } from "@/convex/_generated/dataModel";
import { ProtectedRoute } from "@/components/protected-route";
import { UserMenu } from "@/components/user-menu";

const defaultValues: FormData = {
  company: {
    name: "",
    website: "",
    location: "",
    oneLiner: "",
    stage: "",
    whatDoYouDo: "",
    whyNow: "",
  },
  team: {
    founders: [
      {
        name: "",
        email: "",
        designation: "",
      },
    ],
    isFullTime: true,
    howLongWorked: "",
    relevantExperience: "",
  },
  product: {
    description: "",
    demoUrl: "",
    defensibility: "",
    videoUrl: "",
  },
  market: {
    customer: "",
    competitors: "",
    differentiation: "",
    gtm: "",
    tam: "",
    sam: "",
    som: "",
  },
  traction: {
    isLaunched: "",
    launchDate: "",
    mrr: "",
    growth: "",
    activeUsersCount: "",
    pilots: "",
    kpis: "",
  },
  documents: {
    pitchDeck: [],
    other: [],
  },
};

export default function YCQuestionnaire() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createApplication = useMutation(api.founders.createApplication);

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.team.founders.length) {
        toast.error("At least one founder is required");
        return;
      }

      const primaryEmail = data.team.founders[0]?.email;
      if (!primaryEmail) {
        toast.error("Primary founder email is required");
        return;
      }

      // Clean the data by removing File objects before sending to Convex
      const cleanedData = {
        ...data,
        documents: {
          pitchDeck: data.documents.pitchDeck.map(
            ({ file, storageId, ...fileRef }) => ({
              ...fileRef,
              storageId: storageId ? (storageId as Id<"_storage">) : undefined, // Cast storageId to Convex ID type
            })
          ),
          other: data.documents.other.map(
            ({ file, storageId, ...fileRef }) => ({
              ...fileRef,
              storageId: storageId ? (storageId as Id<"_storage">) : undefined, // Cast storageId to Convex ID type
            })
          ),
        },
      };

      await createApplication({ ...cleanedData, primaryEmail });

      toast.success("Application submitted successfully!");
      form.reset(defaultValues);
    } catch (error) {
      console.error("❌ Submission error:", error);
      toast.error(
        `Failed to submit: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      // Prevent form submission when pressing Enter in input fields
      // Only allow submission through the explicit Submit button
      e.preventDefault();
    }
  };

  const addFounder = () => {
    const currentFounders = form.getValues("team.founders");
    form.setValue("team.founders", [
      ...currentFounders,
      { name: "", email: "", designation: "" },
    ]);
  };

  const removeFounder = (index: number) => {
    const currentFounders = form.getValues("team.founders");
    form.setValue(
      "team.founders",
      currentFounders.filter((_, i) => i !== index)
    );
  };

  // Multistep state and helpers
  const [currentStep, setCurrentStep] = React.useState(0);
  const steps = [
    {
      key: "documents",
      label: "Documents",
      render: () => <DocumentsTab form={form} />,
    },
    {
      key: "company",
      label: "Company",
      render: () => <CompanyTab form={form} />,
    },
    {
      key: "team",
      label: "Team",
      render: () => (
        <TeamTab
          form={form}
          addFounder={addFounder}
          removeFounder={removeFounder}
        />
      ),
    },
    {
      key: "product",
      label: "Product",
      render: () => <ProductTab form={form} />,
    },
    { key: "market", label: "Market", render: () => <MarketTab form={form} /> },
    {
      key: "traction",
      label: "Traction",
      render: () => <TractionTab form={form} />,
    },
  ] as const;

  const totalSteps = steps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentKey = steps[currentStep].key as keyof FormData;
    const isValid = await form.trigger(currentKey, {
      shouldFocus: true,
    });
    if (!isValid) {
      toast.error("Please fill all the important fields before proceeding");
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-semibold text-pretty">
            Founder Questionnaire
          </h1>
          <UserMenu />
        </div>
        <p className="text-muted-foreground mt-1">
          Upload your deck and key docs inline as you answer.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tell us about your company</CardTitle>
          <CardDescription>Keep answers clear and concise.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={handleFormKeyDown}
              className="space-y-6 h-full"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {totalSteps}
                  </div>
                  <div className="flex-1">
                    <Progress value={progressPercent} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {steps.map((s, idx) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setCurrentStep(idx)}
                      className={`px-3 py-1.5 rounded-md border text-sm ${
                        idx === currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-background"
                      }`}
                    >
                      {idx + 1}. {s.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">{steps[currentStep].render()}</div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {currentStep < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit">Submit Application</Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
    </ProtectedRoute>
  );
}
