import { API, BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";
import { API_BASE_URL } from "@/lib/api";

interface GalleryToolData {
  urls: string[];
}

export class GalleryBlockTool implements BlockTool {
  private api: API;
  private readOnly: boolean;
  private data: GalleryToolData;
  private container: HTMLDivElement;
  private isUploading: boolean = false;
  private uploadProgress: string = "";

  static get isReadOnlySupported(): boolean {
    return true;
  }

  static get toolbox() {
    return {
      title: "Galeria zdjęć",
      icon: `<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M15 1H2C1.45 1 1 1.45 1 2V13C1 13.55 1.45 14 2 14H15C15.55 14 16 13.55 16 13V2C16 1.45 15.55 1 15 1ZM15 13H2V3H15V13ZM4.5 9.5L6.5 12.01L9.5 8L13.5 13H3.5L4.5 9.5ZM12.5 5.5C12.5 6.33 11.83 7 11 7C10.17 7 9.5 6.33 9.5 5.5C9.5 4.67 10.17 4 11 4C11.83 4 12.5 4.67 12.5 5.5Z" fill="currentColor"/></svg>`
    };
  }

  constructor({ data, api, readOnly }: BlockToolConstructorOptions<GalleryToolData>) {
    this.api = api;
    this.readOnly = readOnly || false;
    this.data = {
      urls: data && data.urls ? data.urls : []
    };
    this.container = document.createElement("div");
  }

  render(): HTMLElement {
    this.container.classList.add("gallery-tool-container", "p-4", "bg-neutral-900/40", "border", "border-neutral-800", "rounded-xl", "space-y-4");
    this.renderUI();
    return this.container;
  }

  private renderUI() {
    this.container.innerHTML = "";

    // Header
    const header = document.createElement("div");
    header.classList.add("flex", "items-center", "justify-between");
    
    const titleEl = document.createElement("h4");
    titleEl.innerText = "Galeria Zdjęć";
    titleEl.classList.add("text-xs", "font-bold", "text-neutral-300", "uppercase", "tracking-wider");
    header.appendChild(titleEl);

    if (this.data.urls.length > 0) {
      const countEl = document.createElement("span");
      countEl.innerText = `Liczba zdjęć: ${this.data.urls.length}`;
      countEl.classList.add("text-[10px]", "text-muted-foreground");
      header.appendChild(countEl);
    }
    this.container.appendChild(header);

    // List/Grid of existing images
    if (this.data.urls.length > 0) {
      const grid = document.createElement("div");
      grid.classList.add("grid", "grid-cols-2", "sm:grid-cols-4", "gap-3");

      this.data.urls.forEach((url, index) => {
        const item = document.createElement("div");
        item.classList.add("relative", "aspect-[4/3]", "rounded-lg", "overflow-hidden", "border", "border-neutral-800", "bg-neutral-950", "group");

        const img = document.createElement("img");
        img.src = url;
        img.classList.add("w-full", "h-full", "object-cover");
        item.appendChild(img);

        if (!this.readOnly) {
          const deleteBtn = document.createElement("button");
          deleteBtn.type = "button";
          deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.755.033-1.51.077-2.258.132a.75 0 0 0-.671.748v.063c0 .351.256.647.606.689.707.085 1.412.152 2.119.201v7.92c0 1.628 1.322 2.95 2.95 2.95h5.04c1.628 0 2.95-1.322 2.95-2.95v-7.92c.707-.05 1.412-.116 2.119-.201a.715.715 0 0 0 .606-.689v-.063a.75.75 0 0 0-.671-.748c-.748-.055-1.503-.099-2.258-.132V3.75A2.75 2.75 0 0 0 14.25 1h-5.5ZM7.5 3.75A1.25 1.25 0 0 1 8.75 2.5h5.5A1.25 1.25 0 0 1 15.5 3.75v.404c-.846.027-1.693.063-2.537.108V4.25a.75.75 0 0 1-1.5 0v.085c-.477.014-.954.032-1.428.056V4.25a.75.75 0 0 1-1.5 0v.135c-.844.045-1.691.081-2.537.108V3.75Z" clip-rule="evenodd" />
            </svg>
          `;
          deleteBtn.classList.add("absolute", "top-1.5", "right-1.5", "p-1.5", "bg-neutral-950/85", "border", "border-neutral-800", "text-red-400", "hover:text-red-350", "rounded-full", "transition-all", "cursor-pointer");
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.data.urls.splice(index, 1);
            this.renderUI();
          });
          item.appendChild(deleteBtn);
        }

        grid.appendChild(item);
      });

      this.container.appendChild(grid);
    }

    // Upload & Drag-and-Drop Dropzone
    if (!this.readOnly) {
      if (this.isUploading) {
        const loadingZone = document.createElement("div");
        loadingZone.classList.add("flex", "flex-col", "items-center", "justify-center", "w-full", "aspect-video", "sm:aspect-[5/2]", "rounded-xl", "border", "border-neutral-800", "bg-neutral-950/50", "p-6", "text-center");
        
        const spinner = document.createElement("div");
        spinner.classList.add("w-8", "h-8", "rounded-full", "border-2", "border-accent", "border-t-transparent", "animate-spin", "mb-2");
        loadingZone.appendChild(spinner);

        const text = document.createElement("span");
        text.innerText = this.uploadProgress || "Wgrywanie zdjęć...";
        text.classList.add("text-xs", "text-muted-foreground");
        loadingZone.appendChild(text);

        this.container.appendChild(loadingZone);
      } else {
        const dropzone = document.createElement("label");
        dropzone.classList.add("flex", "flex-col", "items-center", "justify-center", "w-full", "aspect-video", "sm:aspect-[5/2]", "rounded-xl", "border-2", "border-dashed", "border-border", "bg-neutral-950/20", "hover:bg-neutral-900/30", "hover:border-neutral-700", "transition-all", "cursor-pointer", "p-6", "text-center");
        
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("p-3", "rounded-full", "bg-neutral-900", "border", "border-neutral-800", "text-neutral-400", "mb-2");
        iconContainer.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        `;
        dropzone.appendChild(iconContainer);

        const promptText = document.createElement("div");
        promptText.innerText = this.data.urls.length > 0 ? "Dodaj kolejne zdjęcia" : "Stwórz galerię zdjęć";
        promptText.classList.add("text-sm", "font-medium", "text-neutral-300");
        dropzone.appendChild(promptText);

        const detailText = document.createElement("div");
        detailText.innerText = "Przeciągnij i upuść lub kliknij, aby wybrać z dysku (wiele plików)";
        detailText.classList.add("text-xs", "text-muted-foreground", "mt-1");
        dropzone.appendChild(detailText);

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.multiple = true;
        fileInput.classList.add("hidden");
        fileInput.addEventListener("change", (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) this.uploadFiles(Array.from(files));
        });
        dropzone.appendChild(fileInput);

        // Drag and drop event listeners
        dropzone.addEventListener("dragover", (e) => {
          e.preventDefault();
          dropzone.classList.add("border-neutral-500", "bg-neutral-800/20");
        });

        dropzone.addEventListener("dragleave", (e) => {
          e.preventDefault();
          dropzone.classList.remove("border-neutral-500", "bg-neutral-800/20");
        });

        dropzone.addEventListener("drop", (e) => {
          e.preventDefault();
          dropzone.classList.remove("border-neutral-500", "bg-neutral-800/20");
          const files = e.dataTransfer?.files;
          if (files) {
            this.uploadFiles(Array.from(files).filter(file => file.type.startsWith("image/")));
          }
        });

        this.container.appendChild(dropzone);
      }
    }
  }

  private async uploadFiles(files: File[]) {
    if (files.length === 0) return;

    this.isUploading = true;
    this.renderUI();

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.uploadProgress = `Wgrywanie zdjęć (${i + 1}/${files.length})...`;
      this.renderUI();

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Błąd wysyłania ${res.status}`);
        }

        const data = await res.json();
        
        let url = "";
        if (data && data.success === 1 && data.file && data.file.url) {
          url = data.file.url;
        } else if (data && data.url) {
          url = data.url;
        } else if (typeof data === "string") {
          url = data;
        }

        if (url) {
          uploadedUrls.push(url);
        }
      } catch (err) {
        console.error("Błąd podczas uploadu obrazu w galerii:", err);
      }
    }

    if (uploadedUrls.length > 0) {
      this.data.urls = [...this.data.urls, ...uploadedUrls];
    }

    this.isUploading = false;
    this.uploadProgress = "";
    this.renderUI();
  }

  save(): GalleryToolData {
    return {
      urls: this.data.urls
    };
  }
}
