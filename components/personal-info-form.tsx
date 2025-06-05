"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import type React from "react"

import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { ResumeData } from "./resume-builder"
import { useTranslation } from "@/hooks/use-translation"
import { useState, useCallback, memo } from "react"
import { Upload, X, Plus, Trash2, Github, Send } from "lucide-react"

interface PersonalInfoFormProps {
  initialData: ResumeData["personalInfo"]
  onSave: (data: ResumeData["personalInfo"]) => void
}

const SOCIAL_PLATFORMS = [
  { value: "github", label: "GitHub", icon: Github },
  { value: "telegram", label: "Telegram", icon: Send },
  { value: "linkedin", label: "LinkedIn", icon: null },
  { value: "twitter", label: "Twitter", icon: null },
  { value: "website", label: "Website", icon: null },
] as const

export const PersonalInfoForm = memo(function PersonalInfoForm({ initialData, onSave }: PersonalInfoFormProps) {
  const { t } = useTranslation()
  const [photoPreview, setPhotoPreview] = useState<string>(initialData.photo || "")

  const formSchema = z.object({
    name: z.string().min(1, t("personalInfo.nameRequired")),
    email: z.string().email(t("personalInfo.emailInvalid")),
    phone: z.string().min(1, t("personalInfo.phoneRequired")),
    address: z.string().optional(),
    summary: z.string().optional(),
    photo: z.string().optional(),
    jobTitle: z.string().optional(),
    socialLinks: z.array(
      z.object({
        platform: z.string().min(1, "Platform is required"),
        url: z.string().optional(),
        username: z.string().min(1, "Username is required"),
      }),
    ),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      socialLinks: initialData.socialLinks || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  })

  const handlePhotoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setPhotoPreview(result)
          form.setValue("photo", result)
        }
        reader.readAsDataURL(file)
      }
    },
    [form],
  )

  const removePhoto = useCallback(() => {
    setPhotoPreview("")
    form.setValue("photo", "")
  }, [form])

  const addSocialLink = useCallback(() => {
    append({
      platform: "",
      url: "",
      username: "",
    })
  }, [append])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("personalInfo.title")}</CardTitle>
        <CardDescription>{t("personalInfo.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Photo Upload */}
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.photo")} ({t("common.optional")})
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {photoPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Profile"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={removePhoto}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                          <p className="mt-2 text-sm text-muted-foreground">{t("personalInfo.photoUpload")}</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="h-14 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.name")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("personalInfo.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.jobTitle")} ({t("common.optional")})
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("personalInfo.jobTitlePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.email")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("personalInfo.emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.phone")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("personalInfo.phonePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.address")} ({t("common.optional")})
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("personalInfo.addressPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("personalInfo.socialLinks")} ({t("common.optional")})
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("personalInfo.addSocialLink")}
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md">
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.platform`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t("personalInfo.platform")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("personalInfo.selectPlatform")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <SelectItem key={platform.value} value={platform.value}>
                                  <div className="flex items-center gap-2">
                                    {platform.icon && <platform.icon className="h-4 w-4" />}
                                    {platform.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.username`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t("personalInfo.username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("personalInfo.usernamePlaceholder")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("personalInfo.summary")} ({t("common.optional")})
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("personalInfo.summaryPlaceholder")} className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {t("common.continue")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
})
