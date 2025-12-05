import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CampaignOffer } from '../../../domain/model/offer.entity';

/**
 * AddOfferFormComponent
 *
 * Form component for adding or editing campaign offers.
 * Can be used in dialog or inline in edit campaign view.
 */
@Component({
  selector: 'app-add-offer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './add-offer-form.component.html',
  styleUrls: ['./add-offer-form.component.css']
})
export class AddOfferFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() campaignId!: number;
  @Input() offer?: CampaignOffer; // If editing existing offer
  @Input() showActions: boolean = true;

  @Output() saveOffer = new EventEmitter<Partial<CampaignOffer>>();
  @Output() cancel = new EventEmitter<void>();

  offerForm: FormGroup;
  isEditMode: boolean = false;

  constructor() {
    this.offerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      partner: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0, Validators.min(0)],
      description: [''],
      category: [''],
      location: [''],
      latitude: [null],
      longitude: [null],
      imageUrl: [''],
      validUntil: [''],
      codePrefix: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
    this.isEditMode = !!this.offer;

    if (this.offer) {
      this.populateForm(this.offer);
    }
  }

  populateForm(offer: CampaignOffer): void {
    this.offerForm.patchValue({
      title: offer.title,
      partner: offer.partner,
      price: offer.price,
      originalPrice: offer.originalPrice,
      description: offer.description,
      category: offer.category,
      location: offer.location,
      latitude: offer.latitude,
      longitude: offer.longitude,
      imageUrl: offer.imageUrl,
      validUntil: offer.validUntil,
      codePrefix: offer.codePrefix
    });
  }

  onSubmit(): void {
    if (this.offerForm.valid) {
      const offerData: Partial<CampaignOffer> = {
        ...this.offerForm.value,
        campaignId: this.campaignId
      };

      if (this.isEditMode && this.offer) {
        offerData.id = this.offer.id;
      }

      this.saveOffer.emit(offerData);

      if (!this.isEditMode) {
        this.offerForm.reset();
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.offerForm.reset();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.offerForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `No debe exceder ${maxLength} caracteres`;
    }
    if (control.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }

    return '';
  }
}
