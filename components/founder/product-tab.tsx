"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { FormData, ProductTabForm } from "@/lib/types";

export function ProductTab({ form }: { form: ProductTabForm }) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Describe the product and share visuals or demos.
      </p>
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="product.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-28"
                  placeholder="Describe your product in detail. What does it do? How does it work? What makes it unique?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="product.demoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://demo.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="product.videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="product.defensibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Defensibility / moat *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24"
                  placeholder="Why is this hard to copy? Data advantages, network effects, proprietary technology, regulatory barriers, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
