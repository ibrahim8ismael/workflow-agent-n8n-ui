"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileTextIcon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
  UploadCloudIcon,
  UsersIcon,
  EyeIcon,
  Edit2Icon,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { listKnowledge, uploadKnowledge, deleteKnowledge, updateKnowledge } from "@/lib/api/knowledge";
import type { KnowledgeDocument } from "@/lib/api/types";
import { formatDate } from "@/lib/formater";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function documentSize(document: KnowledgeDocument): string {
  const contentLength = document.content?.length;
  return contentLength ? formatFileSize(contentLength) : "Markdown";
}

export default function KnowledgePage() {
  const { t } = useTranslation("knowledge");
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewDocument, setViewDocument] = useState<KnowledgeDocument | null>(null);
  const [editDocument, setEditDocument] = useState<KnowledgeDocument | null>(null);
  const [deleteDocument, setDeleteDocument] = useState<KnowledgeDocument | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteDocument) return;
    setIsDeleting(true);
    try {
      await deleteKnowledge(deleteDocument.id);
      setDocuments((current) => current.filter((d) => d.id !== deleteDocument.id));
      setDeleteDocument(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t("deleteError", "Could not delete this document."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editDocument) return;
    setIsEditing(true);
    try {
      const updated = await updateKnowledge(editDocument.id, {
        title: editTitle,
        content: editContent,
      });
      setDocuments((current) =>
        current.map((d) => (d.id === updated.id ? updated : d)),
      );
      setEditDocument(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t("editError", "Could not edit this document."),
      );
    } finally {
      setIsEditing(false);
    }
  };

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setDocuments(await listKnowledge({ take: 100 }));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t("loadError", "Could not load knowledge documents."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDocuments(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDocuments]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".md")) {
      setError(t("markdownOnly", "Only Markdown (.md) files are supported."));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t("fileTooLarge", "Files must be smaller than 5 MB."));
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const document = await uploadKnowledge(file);
      setDocuments((current) => [document, ...current]);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t("uploadError", "Could not upload this document."),
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredDocuments = normalizedQuery
    ? documents.filter((document) =>
        [document.title, document.source, document.content]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery)),
      )
    : documents;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("knowledgeBase")}</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          {t(
            "description",
            "Upload Markdown documents your AI employees can use to answer questions and complete tasks.",
          )}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".md,text/markdown"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-10 text-center transition-colors hover:bg-muted/40 disabled:cursor-wait disabled:opacity-70"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background shadow-sm">
          {isUploading ? (
            <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <UploadCloudIcon className="h-6 w-6 text-primary" />
          )}
        </div>
        <h3 className="text-lg font-semibold">
          {isUploading
            ? t("uploading", "Uploading document...")
            : t("uploadDocument", "Upload Markdown document")}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isUploading
            ? t("processing", "Please wait while we process your document.")
            : t("fileTypes", "Markdown files up to 5 MB")}
        </p>
      </button>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void loadDocuments()}>
            <RefreshCwIcon className="mr-2 h-3.5 w-3.5" />
            {t("retry", "Retry")}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("documents", "Documents")}
          </h2>
          <div className="relative w-full sm:w-[250px]">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchDocs", "Search documents...")}
              className="h-9 rounded-lg bg-background pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="space-y-4 p-5">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-2/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <FileTextIcon className="mb-4 h-10 w-10 text-muted-foreground/50" />
              <h3 className="font-semibold">
                {query ? t("noSearchResults", "No matching documents") : t("noDocuments")}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {query
                  ? t("tryAnotherSearch", "Try a different search term.")
                  : t("emptyDescription", "Upload a Markdown document to give your employees useful context.")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="overflow-hidden border-border/50 bg-card/40">
                <CardContent className="flex min-h-[170px] flex-col p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
                      <FileTextIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className="mr-2 border-transparent bg-emerald-500/10 text-[10px] font-medium text-emerald-600">
                        {t("synced", "Synced")}
                      </Badge>
                      <Button variant="ghost" size="icon-sm" onClick={() => setViewDocument(document)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => {
                        setEditDocument(document);
                        setEditTitle(document.title || "");
                        setEditContent(document.content || "");
                      }}>
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteDocument(document)}>
                        <Trash2Icon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <span className="line-clamp-2 font-semibold text-foreground">{document.title}</span>
                  <div className="mt-auto flex items-center gap-2 pt-4 text-[11px] text-muted-foreground">
                    <span className="capitalize">{document.contentType}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{documentSize(document)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {t("agents", "AI employees")}
                    </span>
                    <span>{formatDate(document.createdAt, "day-month")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewDocument} onOpenChange={(open) => !open && setViewDocument(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-3xl flex max-h-[90dvh] flex-col">
          <DialogHeader className="border-b px-6 py-4 pt-5">
            <DialogTitle>{viewDocument?.title}</DialogTitle>
            <DialogDescription>
              {viewDocument?.contentType} • {viewDocument ? documentSize(viewDocument) : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto p-6">
            <div className="whitespace-pre-wrap text-sm border border-border/50 p-4 rounded-md bg-muted/20">
              {viewDocument?.content || t("noContent", "No content available.")}
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 border-t p-4 mt-auto">
            <DialogClose render={<Button type="button" variant="ghost" onClick={() => setViewDocument(null)} />}>
              {t("close", "Close")}
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDocument} onOpenChange={(open) => !open && setEditDocument(null)}>
        <DialogContent className="gap-0 p-0 sm:max-w-3xl flex max-h-[90dvh] flex-col">
          <DialogHeader className="border-b px-6 py-4 pt-5">
            <DialogTitle>{t("editDocument", "Edit Document")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">{t("title", "Title")}</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">{t("content", "Content")}</Label>
              <Textarea
                id="content"
                className="min-h-[300px]"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-2 border-t p-4 mt-auto">
            <DialogClose render={<Button type="button" variant="ghost" onClick={() => setEditDocument(null)} />}>
              {t("cancel", "Cancel")}
            </DialogClose>
            <Button size="sm" onClick={handleEdit} disabled={isEditing}>
              {isEditing && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {t("save", "Save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteDocument} onOpenChange={(open) => !open && setDeleteDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle", "Are you sure?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDesc", "This action cannot be undone. This will permanently delete the document.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("cancel", "Cancel")}</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {t("delete", "Delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
