import { API, BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

interface GalleryToolData {
  urls: string[];
}

export class GalleryTool implements BlockTool {
  private api: API;
  private readOnly: boolean;
  private data: GalleryToolData;
  private container: HTMLDivElement;

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

    const titleEl = document.createElement("h4");
    titleEl.innerText = "Galeria Zdjęć (Adresy URL)";
    titleEl.classList.add("text-xs", "font-bold", "text-neutral-300", "uppercase", "tracking-wider");
    this.container.appendChild(titleEl);

    const listContainer = document.createElement("div");
    listContainer.classList.add("space-y-2");
    
    this.data.urls.forEach((url, index) => {
      const row = document.createElement("div");
      row.classList.add("flex", "items-center", "gap-3");

      const imgPreview = document.createElement("img");
      if (url) {
        imgPreview.src = url;
      }
      imgPreview.classList.add("w-12", "h-12", "object-cover", "rounded-lg", "bg-neutral-900", "border", "border-neutral-800");
      imgPreview.style.display = url ? "block" : "none";
      imgPreview.onerror = () => { imgPreview.style.display = "none"; };
      
      const input = document.createElement("input");
      input.type = "text";
      input.value = url;
      input.placeholder = "Wklej adres URL zdjęcia (np. z Unsplash)";
      input.classList.add("flex-grow", "rounded-lg", "border", "border-neutral-800", "bg-neutral-950", "px-3", "py-2", "text-sm", "text-foreground", "focus:border-neutral-600", "focus:outline-none");
      input.disabled = this.readOnly;
      input.addEventListener("input", (e) => {
        const val = (e.target as HTMLInputElement).value;
        this.data.urls[index] = val;
        if (val) {
          imgPreview.src = val;
          imgPreview.style.display = "block";
        } else {
          imgPreview.style.display = "none";
        }
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.755.033-1.51.077-2.258.132a.75.75 0 0 0-.671.748v.063c0 .351.256.647.606.689.707.085 1.412.152 2.119.201v7.92c0 1.628 1.322 2.95 2.95 2.95h5.04c1.628 0 2.95-1.322 2.95-2.95v-7.92c.707-.05 1.412-.116 2.119-.201a.715.715 0 0 0 .606-.689v-.063a.75.75 0 0 0-.671-.748c-.748-.055-1.503-.099-2.258-.132V3.75A2.75 2.75 0 0 0 14.25 1h-5.5ZM7.5 3.75A1.25 1.25 0 0 1 8.75 2.5h5.5A1.25 1.25 0 0 1 15.5 3.75v.404c-.846.027-1.693.063-2.537.108V4.25a.75.75 0 0 1-1.5 0v.085c-.477.014-.954.032-1.428.056V4.25a.75.75 0 0 1-1.5 0v.135c-.844.045-1.691.081-2.537.108V3.75Z" clip-rule="evenodd" />
        </svg>
      `;
      removeBtn.classList.add("p-2.5", "text-red-400", "hover:text-red-300", "hover:bg-red-950/20", "rounded-lg", "transition-colors", "cursor-pointer");
      removeBtn.disabled = this.readOnly;
      removeBtn.addEventListener("click", () => {
        this.data.urls.splice(index, 1);
        this.renderUI();
      });

      row.appendChild(imgPreview);
      row.appendChild(input);
      row.appendChild(removeBtn);
      listContainer.appendChild(row);
    });

    this.container.appendChild(listContainer);

    if (!this.readOnly) {
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.innerText = "+ Dodaj kolejne zdjęcie";
      addBtn.classList.add("w-full", "py-2", "text-xs", "font-medium", "border", "border-dashed", "border-neutral-800", "rounded-lg", "text-neutral-450", "hover:text-neutral-200", "hover:border-neutral-600", "transition-colors", "cursor-pointer", "bg-neutral-950/50");
      addBtn.addEventListener("click", () => {
        this.data.urls.push("");
        this.renderUI();
      });
      this.container.appendChild(addBtn);
    }
  }

  save(): GalleryToolData {
    return {
      urls: this.data.urls.filter((url) => url.trim() !== "")
    };
  }
}
