"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { ResumeData } from "./resume-builder"
import { useTranslation } from "@/hooks/use-translation"

const formSchema = z.object({
  skill: z.string().optional(),
})

interface SkillsFormProps {
  initialData: ResumeData["skills"]
  onSave: (data: ResumeData["skills"]) => void
}

export function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const { t } = useTranslation()
  const [skills, setSkills] = useState<string[]>(initialData || [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
    },
  })

  function addSkill(skill: string) {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()])
      form.reset()
    }
  }

  function removeSkill(skillToRemove: string) {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.skill) {
      addSkill(values.skill)
    } else {
      onSave(skills)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      const value = form.getValues().skill
      if (value) {
        addSkill(value)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("skills.title")}</CardTitle>
        <CardDescription>{t("skills.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="skill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("skills.addSkills")}</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input placeholder={t("skills.skillPlaceholder")} {...field} onKeyDown={handleKeyDown} />
                      <Button
                        type="button"
                        onClick={() => {
                          const value = form.getValues().skill
                          if (value) {
                            addSkill(value)
                          }
                        }}
                      >
                        {t("skills.addButton")}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-md p-4 min-h-[100px]">
              <div className="text-sm font-medium mb-2">{t("skills.yourSkills")}</div>
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("skills.noSkills")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-2 py-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                        <span className="sr-only">
                          {t("skills.removeSkill")} {skill}
                        </span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="button" className="w-full" onClick={() => onSave(skills)} disabled={skills.length === 0}>
              {t("common.continue")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
