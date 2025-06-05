"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import type { ResumeData } from "./resume-builder"
import { useTranslation } from "@/hooks/use-translation"

interface EducationFormProps {
  initialData: ResumeData["education"]
  onSave: (data: ResumeData["education"]) => void
}

export function EducationForm({ initialData, onSave }: EducationFormProps) {
  const { t } = useTranslation()

  const educationItemSchema = z.object({
    institution: z.string().min(1, t("education.institutionRequired")),
    degree: z.string().min(1, t("education.degreeRequired")),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().min(1, t("education.startDateRequired")),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })

  const formSchema = z.object({
    education: z.array(educationItemSchema).min(1, t("education.minOneEntry")),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      education: initialData.length
        ? initialData
        : [
            {
              institution: "",
              degree: "",
              fieldOfStudy: "",
              startDate: "",
              endDate: "",
              description: "",
            },
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values.education)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("education.title")}</CardTitle>
        <CardDescription>{t("education.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t("education.removeEducation")}</span>
                  </Button>
                )}

                <FormField
                  control={form.control}
                  name={`education.${index}.institution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("education.institution")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t("education.institutionPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`education.${index}.degree`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("education.degree")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t("education.degreePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`education.${index}.fieldOfStudy`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("education.fieldOfStudy")} ({t("common.optional")})
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t("education.fieldOfStudyPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("education.startDate")} <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t("education.startDatePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`education.${index}.endDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("education.endDate")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("education.endDatePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`education.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("education.description")} ({t("common.optional")})
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("education.descriptionPlaceholder")}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                append({
                  institution: "",
                  degree: "",
                  fieldOfStudy: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("education.addEducation")}
            </Button>

            <Button type="submit" className="w-full">
              {t("common.continue")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
