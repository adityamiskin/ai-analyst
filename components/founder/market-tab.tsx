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
import type { FormData, MarketTabForm } from "@/lib/types";

export function MarketTab({ form }: { form: MarketTabForm }) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Customers, competitors, and how big this can be.
      </p>
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="market.customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who is your customer? *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24"
                  placeholder="Be specific about your target customer. Demographics, company size, role, pain points, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="market.competitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Competitors *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24"
                  placeholder="List direct and indirect competitors. Include both established companies and other startups."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="market.differentiation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How are you different? *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24"
                  placeholder="What's your unique value proposition? How do you differentiate from competitors?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="market.gtm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Go-to-market *</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-24"
                  placeholder="How will you acquire customers? Sales strategy, marketing channels, partnerships, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="market.tam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TAM</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 20B, $20B, ₹1500Cr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="market.sam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SAM</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4B, $4B, ₹300Cr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="market.som"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SOM</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 400M, $400M, ₹30Cr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
}
