import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, FileText, Layers3, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  getListServicesQueryKey,
  useCreateService,
  useDeleteService,
  useListServices,
  useUpdateService,
} from '@workspace/api-client-react';
import type { Service, ServiceWrite } from '@workspace/api-client-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type BillingType = 'recurring' | 'one_time';
type Draft = {
  name: string;
  description: string;
  scope: string;
  basePrice: string;
  billingType: BillingType | '';
};

type ServiceFormValues = Draft;

const blankDraft = (): Draft => ({
  name: '',
  description: '',
  scope: '',
  basePrice: '',
  billingType: '',
});

const fieldClass = 'mt-2 w-full rounded-xl border border-[#cbd6e2] bg-[#f8fafc] px-3.5 py-3 text-sm text-[#202f4d] outline-none transition-colors placeholder:text-[#97a4b4] focus:border-[#58bfc2] focus:bg-white focus:ring-2 focus:ring-[#58bfc2]/15';
const billingLabel = (type: BillingType | null) => type === 'recurring' ? 'Recorrente' : type === 'one_time' ? 'Pontual' : 'A definir';
const formatPrice = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ServiceCatalogManager({ onBack }: { onBack: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<ServiceFormValues>({
    defaultValues: blankDraft(),
  });
  const servicesQuery = useListServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const [search, setSearch] = useState('');
  const [billingFilter, setBillingFilter] = useState<'all' | BillingType | 'unset'>('all');
  const [dialog, setDialog] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [actionError, setActionError] = useState('');

  const services = servicesQuery.data?.services ?? [];
  const filteredServices = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return services.filter((service) => {
      const matchesText = !term || `${service.name} ${service.description} ${service.scope}`.toLocaleLowerCase('pt-BR').includes(term);
      const matchesBilling = billingFilter === 'all'
        || (billingFilter === 'unset' ? service.billingType === null : service.billingType === billingFilter);
      return matchesText && matchesBilling;
    });
  }, [billingFilter, search, services]);

  const refreshCatalog = () => queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });

  const startCreate = () => {
    setEditing(null);
    form.reset(blankDraft());
    setActionError('');
    setDialog('create');
  };

  const startEdit = (service: Service) => {
    setEditing(service);
    form.reset({
      name: service.name,
      description: service.description,
      scope: service.scope,
      basePrice: service.basePrice === null ? '' : String(service.basePrice),
      billingType: service.billingType ?? '',
    });
    setActionError('');
    setDialog('edit');
  };

  const closeForm = () => {
    if (createService.isPending || updateService.isPending) return;
    setDialog(null);
    setEditing(null);
  };

  const saveService = (values: ServiceFormValues) => {
    setActionError('');
    const parsedPrice = values.basePrice === '' ? null : Number(values.basePrice);
    const data: ServiceWrite = {
      name: values.name.trim(),
      description: values.description.trim(),
      scope: values.scope.trim(),
      basePrice: parsedPrice,
      billingType: values.billingType || null,
    };
    const onSuccess = () => {
      void refreshCatalog();
      setDialog(null);
      setEditing(null);
    };
    const onError = () => setActionError('Não foi possível salvar o serviço. Revise os campos e tente novamente.');
    if (dialog === 'edit' && editing) {
      updateService.mutate({ serviceId: editing.id, data }, { onSuccess, onError });
    } else {
      createService.mutate({ data }, { onSuccess, onError });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setActionError('');
    deleteService.mutate({ serviceId: deleteTarget.id }, {
      onSuccess: () => {
        void refreshCatalog();
        setDeleteTarget(null);
      },
      onError: () => setActionError('Não foi possível remover este serviço. Tente novamente.'),
    });
  };

  const isSaving = createService.isPending || updateService.isPending;

  return (
    <section className="mx-auto max-w-7xl pb-12" aria-labelledby="catalog-title" data-testid="section-service-catalog">
      <div className="mb-7 flex flex-col justify-between gap-5 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_16px_45px_rgba(32,47,77,.07)] sm:flex-row sm:items-end sm:p-8">
        <div>
          <button type="button" onClick={onBack} data-testid="button-catalog-back" className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[#d3deea] bg-white px-3 py-2 text-xs font-bold text-[#56657d] transition-colors hover:border-[#58bfc2] hover:text-[#202f4d]">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Voltar ao CRM
          </button>
          <p className="flex items-center gap-2 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]"><span className="h-2 w-2 rounded-full bg-[#58c5c8]" /> Administração / Catálogo</p>
          <h1 id="catalog-title" className="mt-3 font-display text-3xl font-semibold tracking-[-.05em] text-[#202f4d] sm:text-5xl">Serviços</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687890]">Mantenha nome, descrição, escopo e condições comerciais em campos independentes.</p>
        </div>
        <button type="button" onClick={startCreate} data-testid="button-service-create" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#202f4d] px-5 py-3 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(32,47,77,.16)] transition-all hover:-translate-y-0.5 hover:bg-[#314665]">
          <Plus className="h-4 w-4" aria-hidden="true" /> Cadastrar serviço
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_8px_22px_rgba(32,47,77,.05)] sm:flex-row sm:items-center sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#d9e0e9] bg-[#f7f9fb] px-3.5 focus-within:border-[#58bfc2]">
            <Search className="h-4 w-4 shrink-0 text-[#8090a5]" aria-hidden="true" />
            <input type="search" aria-label="Buscar serviços" data-testid="input-service-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar serviço, descrição ou escopo" className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#202f4d] outline-none placeholder:text-[#9aa7b6]" />
          </div>
          <label className="sr-only" htmlFor="service-billing-filter">Filtrar por tipo de cobrança</label>
          <select id="service-billing-filter" aria-label="Filtrar por tipo de cobrança" data-testid="select-service-billing-filter" value={billingFilter} onChange={(event) => setBillingFilter(event.target.value as typeof billingFilter)} className="h-11 rounded-xl border border-[#d9e0e9] bg-[#f7f9fb] px-3.5 text-xs font-bold text-[#56657d] outline-none focus:border-[#58bfc2]">
            <option value="all">Todos os tipos</option>
            <option value="recurring">Recorrente</option>
            <option value="one_time">Pontual</option>
            <option value="unset">Tipo a definir</option>
          </select>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#d9e0e9] bg-[#eaf5f5] px-5 py-4" data-testid="text-service-count">
          <Layers3 className="h-4 w-4 text-[#438e92]" aria-hidden="true" />
          <p className="text-xs font-bold text-[#416e77]"><span className="font-mono-vg text-sm">{services.length}</span> {services.length === 1 ? 'serviço ativo' : 'serviços ativos'}</p>
        </div>
      </div>

      {actionError && <div role="alert" data-testid="alert-service-action-error" className="mb-4 flex items-start gap-3 rounded-xl border border-[#e8c4c0] bg-[#fff6f4] px-4 py-3 text-sm font-semibold text-[#994f49]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{actionError}</div>}

      <section aria-label="Lista de serviços ativos" className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_16px_35px_rgba(32,47,77,.08)]">
        <div className="flex items-center justify-between border-b border-[#d9e0e9] px-5 py-4 sm:px-6">
          <div><p className="font-display text-lg font-semibold tracking-[-.02em] text-[#202f4d]">Catálogo ativo</p><p className="mt-1 text-xs text-[#7a8799]" data-testid="text-service-results">{filteredServices.length} {filteredServices.length === 1 ? 'resultado' : 'resultados'}</p></div>
          <span className="hidden rounded-full bg-[#eef8f8] px-3 py-1.5 font-mono-vg text-[9px] uppercase tracking-[.12em] text-[#587f82] sm:block">VG / serviços</span>
        </div>

        {servicesQuery.isLoading ? (
          <div aria-live="polite" data-testid="status-service-loading" className="space-y-4 p-5 sm:p-6">
            <p className="text-xs font-semibold text-[#687890]">Carregando catálogo…</p>
            {[0, 1, 2].map((item) => <div key={item} className="grid animate-pulse gap-3 rounded-2xl border border-[#edf1f5] p-5 sm:grid-cols-3"><span className="h-4 rounded bg-[#edf2f6]" /><span className="h-4 rounded bg-[#edf2f6]" /><span className="h-4 rounded bg-[#edf2f6]" /></div>)}
          </div>
        ) : servicesQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center" data-testid="status-service-load-error">
            <AlertCircle className="h-7 w-7 text-[#aa5a55]" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl font-semibold text-[#202f4d]">Não foi possível carregar o catálogo</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#687890]">Verifique sua conexão com o CRM e tente carregar os serviços novamente.</p>
            <button type="button" onClick={() => void servicesQuery.refetch()} data-testid="button-service-retry" className="mt-5 rounded-xl bg-[#202f4d] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#314665]">Tentar novamente</button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center" data-testid="status-service-empty">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f5] text-[#438e92]"><FileText className="h-5 w-5" aria-hidden="true" /></div>
            <h2 className="mt-4 font-display text-xl font-semibold text-[#202f4d]">{services.length === 0 ? 'Catálogo sem serviços' : 'Nenhum serviço encontrado'}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#687890]">{services.length === 0 ? 'Cadastre o primeiro serviço para manter as ofertas organizadas no CRM.' : 'Altere a busca ou os filtros para encontrar um serviço ativo.'}</p>
            {services.length === 0
              ? <button type="button" onClick={startCreate} data-testid="button-service-create-empty" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#202f4d] px-4 py-2.5 text-xs font-extrabold text-white"><Plus className="h-3.5 w-3.5" /> Cadastrar serviço</button>
              : <button type="button" onClick={() => { setSearch(''); setBillingFilter('all'); }} data-testid="button-service-clear-filters" className="mt-5 rounded-xl border border-[#cbd6e2] bg-white px-4 py-2.5 text-xs font-bold text-[#56657d]">Limpar filtros</button>}
          </div>
        ) : (
          <div className="divide-y divide-[#edf1f5]">
            {filteredServices.map((service, index) => (
              <article key={service.id} data-testid={`row-service-${service.id}`} className="grid gap-5 px-5 py-5 transition-colors hover:bg-[#fbfcfd] sm:px-6 lg:grid-cols-[minmax(150px,1fr)_minmax(220px,1.35fr)_minmax(180px,1.1fr)_minmax(135px,.8fr)_auto] lg:items-start lg:gap-6">
                <div className="min-w-0">
                  <p className="mb-2 font-mono-vg text-[9px] uppercase tracking-[.13em] text-[#8290a2]">Serviço {String(index + 1).padStart(2, '0')}</p>
                  <h3 data-testid={`text-service-name-${service.id}`} className="font-display text-base font-semibold leading-snug tracking-[-.02em] text-[#202f4d]">{service.name}</h3>
                </div>
                <div className="min-w-0"><p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#8290a2]">Descrição</p><p data-testid={`text-service-description-${service.id}`} className="whitespace-pre-wrap text-xs leading-6 text-[#627187]">{service.description || 'Não informada'}</p></div>
                <div className="min-w-0"><p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#8290a2]">Escopo</p><p data-testid={`text-service-scope-${service.id}`} className="whitespace-pre-wrap text-xs leading-6 text-[#627187]">{service.scope || 'Não informado'}</p></div>
                <div><p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#8290a2]">Preço / cobrança</p><p data-testid={`text-service-price-${service.id}`} className="text-sm font-extrabold tabular-nums text-[#202f4d]">{service.basePrice === null ? 'A definir' : formatPrice(service.basePrice)}</p><span data-testid={`status-service-billing-${service.id}`} className="mt-2 inline-flex rounded-full bg-[#eaf5f5] px-2.5 py-1 text-[9px] font-extrabold text-[#438187]">{billingLabel(service.billingType)}</span></div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <button type="button" onClick={() => startEdit(service)} aria-label={`Editar serviço ${service.name}`} data-testid={`button-service-edit-${service.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9e0e9] bg-white px-3 text-xs font-bold text-[#56657d] transition-colors hover:border-[#58bfc2] hover:text-[#202f4d]"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /><span className="sm:hidden lg:inline">Editar</span></button>
                  <button type="button" onClick={() => { setDeleteTarget(service); setActionError(''); }} aria-label={`Remover serviço ${service.name}`} data-testid={`button-service-delete-${service.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#ead6d5] bg-white px-3 text-xs font-bold text-[#a25652] transition-colors hover:border-[#c77c76] hover:bg-[#fff8f7]"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /><span className="sm:hidden lg:inline">Remover</span></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <p data-testid="text-catalog-field-guidance" className="mt-4 max-w-3xl text-xs leading-6 text-[#77869a]">Descrição apresenta o serviço. Escopo descreve as entregas previstas. Preço-base e tipo de cobrança ficam em branco até serem definidos pela equipe.</p>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#061a36]/65 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="service-form-title" data-testid="dialog-service-form" className="my-auto max-h-[calc(100dvh-24px)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-[#fbfcfd] shadow-[0_24px_70px_rgba(6,26,54,.3)] sm:max-h-[calc(100dvh-48px)]">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e4e9ef] bg-[#fbfcfd]/95 px-5 py-5 backdrop-blur sm:px-7">
              <div><p className="font-mono-vg text-[9px] uppercase tracking-[.18em] text-[#58739f]">Catálogo / edição</p><h2 id="service-form-title" className="mt-2 font-display text-2xl font-semibold tracking-[-.04em] text-[#202f4d]">{dialog === 'create' ? 'Cadastrar serviço' : 'Editar serviço'}</h2><p className="mt-1 text-xs text-[#728096]">Descrição e escopo são salvos de forma independente.</p></div>
              <button type="button" onClick={closeForm} disabled={isSaving} aria-label="Fechar formulário de serviço" data-testid="button-service-form-close" className="rounded-xl border border-[#d9e0e9] bg-white p-2.5 text-[#63738a] transition-colors hover:border-[#58bfc2] disabled:opacity-50"><X className="h-4 w-4" aria-hidden="true" /></button>
            </header>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(saveService)} noValidate className="space-y-5 px-5 py-6 sm:px-7">
              <FormField control={form.control} name="name" rules={{ required: 'Informe o nome do serviço.', maxLength: { value: 180, message: 'O nome pode ter até 180 caracteres.' }, validate: (value) => value.trim().length > 0 || 'Informe o nome do serviço.' }} render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="service-name" className="text-xs font-extrabold text-[#34445e]">Nome do serviço <span className="text-[#a25652]">*</span></FormLabel>
                  <FormControl><input id="service-name" autoFocus maxLength={180} {...field} data-testid="input-service-name" placeholder="Nome do serviço" className={fieldClass} /></FormControl>
                  <FormMessage data-testid="message-service-name" />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" rules={{ required: 'Informe a descrição do serviço.', maxLength: { value: 5000, message: 'A descrição pode ter até 5.000 caracteres.' }, validate: (value) => value.trim().length > 0 || 'Informe a descrição do serviço.' }} render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="service-description" className="text-xs font-extrabold text-[#34445e]">Descrição <span className="text-[#a25652]">*</span></FormLabel>
                  <FormControl><textarea id="service-description" rows={4} maxLength={5000} {...field} data-testid="textarea-service-description" placeholder="Explique o serviço em termos claros." className={`${fieldClass} resize-y leading-6`} /></FormControl>
                  <FormDescription className="mt-1.5 text-[10px] text-[#8b98a8]">Apresenta o serviço; não substitui a lista de entregas.</FormDescription>
                  <FormMessage data-testid="message-service-description" />
                </FormItem>
              )} />
              <FormField control={form.control} name="scope" rules={{ maxLength: { value: 10000, message: 'O escopo pode ter até 10.000 caracteres.' } }} render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="service-scope" className="text-xs font-extrabold text-[#34445e]">Escopo <span className="font-medium text-[#8b98a8]">(opcional)</span></FormLabel>
                  <FormControl><textarea id="service-scope" rows={4} maxLength={10000} {...field} data-testid="textarea-service-scope" placeholder="Detalhe entregas, limites ou atividades previstas." className={`${fieldClass} resize-y leading-6`} /></FormControl>
                  <FormMessage data-testid="message-service-scope" />
                </FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="basePrice" rules={{ validate: (value) => value === '' || /^(?:\d{1,10})(?:\.\d{1,2})?$/.test(value) || 'Informe um preço com até duas casas decimais ou deixe o campo em branco.' }} render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="service-price" className="text-xs font-extrabold text-[#34445e]">Preço-base <span className="font-medium text-[#8b98a8]">(opcional)</span></FormLabel>
                    <div className="relative"><span className="absolute left-3.5 top-[23px] text-sm font-bold text-[#8795a7]">R$</span><FormControl><input id="service-price" type="number" min="0" step="0.01" inputMode="decimal" {...field} data-testid="input-service-price" placeholder="Sem preço definido" className={`${fieldClass} pl-10`} /></FormControl></div>
                    <FormMessage data-testid="message-service-price" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="billingType" render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="service-billing" className="text-xs font-extrabold text-[#34445e]">Tipo de cobrança <span className="font-medium text-[#8b98a8]">(opcional)</span></FormLabel>
                    <FormControl><select id="service-billing" {...field} data-testid="select-service-billing" className={fieldClass}><option value="">Não definido</option><option value="recurring">Recorrente</option><option value="one_time">Pontual</option></select></FormControl>
                    <FormMessage data-testid="message-service-billing" />
                  </FormItem>
                )} />
              </div>
              {actionError && <p role="alert" data-testid="alert-service-save-error" className="rounded-xl border border-[#e8c4c0] bg-[#fff6f4] px-4 py-3 text-xs font-semibold text-[#994f49]">{actionError}</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-[#e4e9ef] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} disabled={isSaving} data-testid="button-service-form-cancel" className="h-11 rounded-xl border border-[#cbd6e2] bg-white px-5 text-xs font-bold text-[#56657d] hover:bg-[#f4f7fa] disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isSaving} data-testid="button-service-form-submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#202f4d] px-5 text-xs font-extrabold text-white transition-colors hover:bg-[#314665] disabled:cursor-wait disabled:opacity-65">{isSaving ? 'Salvando…' : <><Plus className="h-3.5 w-3.5" aria-hidden="true" />{dialog === 'create' ? 'Adicionar serviço' : 'Salvar alterações'}</>}</button>
              </div>
              {isSaving && <p role="status" aria-live="polite" data-testid="status-service-saving" className="text-center text-xs font-semibold text-[#58739f]">Salvando serviço no catálogo…</p>}
            </form>
            </Form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#061a36]/65 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleteService.isPending) setDeleteTarget(null); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="service-delete-title" aria-describedby="service-delete-description" data-testid="dialog-service-delete" className="w-full max-w-md rounded-3xl border border-white/70 bg-[#fbfcfd] p-6 shadow-[0_24px_70px_rgba(6,26,54,.3)] sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbefee] text-[#a25652]"><Trash2 className="h-5 w-5" aria-hidden="true" /></div>
            <h2 id="service-delete-title" className="mt-5 font-display text-2xl font-semibold tracking-[-.04em] text-[#202f4d]">Remover serviço?</h2>
            <p id="service-delete-description" className="mt-2 text-sm leading-6 text-[#687890]">“{deleteTarget.name}” sairá do catálogo ativo, mas seu registro será preservado no sistema. Esta ação não apaga o histórico do serviço.</p>
            {actionError && <p role="alert" data-testid="alert-service-delete-error" className="mt-4 rounded-xl border border-[#e8c4c0] bg-[#fff6f4] px-4 py-3 text-xs font-semibold text-[#994f49]">{actionError}</p>}
            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleteService.isPending} onClick={() => setDeleteTarget(null)} data-testid="button-service-delete-cancel" className="h-11 rounded-xl border border-[#cbd6e2] bg-white px-5 text-xs font-bold text-[#56657d] disabled:opacity-50">Manter serviço</button>
              <button type="button" disabled={deleteService.isPending} onClick={confirmDelete} data-testid="button-service-delete-confirm" className="h-11 rounded-xl bg-[#a25652] px-5 text-xs font-extrabold text-white transition-colors hover:bg-[#8c4643] disabled:cursor-wait disabled:opacity-65">{deleteService.isPending ? 'Removendo…' : 'Remover do catálogo'}</button>
            </div>
            {deleteService.isPending && <p role="status" aria-live="polite" data-testid="status-service-deleting" className="mt-3 text-center text-xs font-semibold text-[#58739f]">Atualizando catálogo ativo…</p>}
          </section>
        </div>
      )}
    </section>
  );
}
