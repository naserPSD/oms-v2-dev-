import { Invoice } from '@module/subscription/entities/invoices.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'account_invoice_items', synchronize: false })
export class InvoiceItem {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true }) id: number;
  @Column({ name: 'invoice_id', type: 'int', unsigned: true }) invoiceId: number;
  @ManyToOne(() => Invoice, (invoice) => invoice.items, { nullable: false, onDelete: 'CASCADE' }) @JoinColumn({ name: 'invoice_id' }) invoice: Invoice;
  @Column({ type: 'text' }) description: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 }) unitPrice: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) discount: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) tax: number;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) total: number;
}