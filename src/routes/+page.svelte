<script lang="ts">
	let amount = $state(1);
	let fromCurrency = $state('USD');
	let toCurrency = $state('CAD');
	let result = $state(0);
	let rate = $state(0);
	let lastUpdated = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const currencies = [
		{ code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
		{ code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
		{ code: 'EUR', name: 'Euro', flag: '🇪🇺' },
		{ code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
		{ code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
		{ code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
		{ code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
		{ code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
	];

	const fromFlag = $derived(currencies.find((c) => c.code === fromCurrency)?.flag ?? '🏳️');
	const toFlag = $derived(currencies.find((c) => c.code === toCurrency)?.flag ?? '🏳️');

	async function fetchRate() {
		isLoading = true;
		error = null;
		try {
			const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
			if (!response.ok) throw new Error('Failed to fetch exchange rates');

			const data = await response.json();
			const conversionRate = data.rates[toCurrency];

			if (!conversionRate) throw new Error('Currency pair not supported');

			rate = conversionRate;
			lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} catch (e) {
			error = e instanceof Error ? e.message : 'An unexpected error occurred';
		} finally {
			isLoading = false;
		}
	}

	function swapCurrencies() {
		[fromCurrency, toCurrency] = [toCurrency, fromCurrency];
	}

	// Recalculate result when amount or rate changes
	$effect(() => {
		result = amount * rate;
	});

	let color = $state('text-emerald-400');

	// Update color when result changes
	$effect(() => {
		if (result > amount) color = 'text-emerald-400';
		else if (result < amount) color = 'text-rose-400';
		else color = 'text-white';
	});

	// Refetch when the currency pair changes
	$effect(() => {
		fromCurrency;
		toCurrency;
		fetchRate();
	});
</script>

<div class="min-h-dvh bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
	<!-- Ambient background glow -->
	<div class="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]"></div>
	<div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]"></div>

	<main class="relative w-full max-w-2xl">
		<!-- Branding -->
		<header class="mb-8 flex items-center justify-center gap-3">
			<h1 class="text-4xl font-semibold tracking-tight text-slate-100">Currency Translator</h1>
		</header>

		<!-- Card -->
		<section class="rounded-3xl bg-slate-900/70 ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
			<!-- Translator-style top bar: From | swap | To -->
			<div class="flex items-stretch border-b border-white/10">
				<div class="group flex flex-1 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/5">
					<span class="text-2xl">{fromFlag}</span>
					<span class="min-w-0 flex-1">
						<label for="fromCurrency" class="block truncate text-xs text-slate-500">From</label>
						<select
							id="fromCurrency"
							bind:value={fromCurrency}
							class="w-full appearance-none bg-transparent text-sm font-semibold text-slate-100 outline-none"
						>
							{#each currencies as currency}
								<option value={currency.code}>
									{currency.flag} {currency.code} — {currency.name}
								</option>
							{/each}
						</select>
					</span>
				</div>

				<div class="flex items-center">
					<button
						type="button"
						onclick={swapCurrencies}
						title="Swap currencies"
						class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 ring-1 ring-white/10 text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-90"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
						</svg>
					</button>
				</div>

				<div class="group flex flex-1 items-center gap-3 px-5 py-4 text-right transition-colors hover:bg-white/5 justify-end">
					<span class="min-w-0 flex-1">
						<label for="toCurrency" class="block truncate text-xs text-slate-500">To</label>
						<select
							id="toCurrency"
							bind:value={toCurrency}
							class="w-full appearance-none bg-transparent text-right text-sm font-semibold text-slate-100 outline-none"
						>
							{#each currencies as currency}
								<option value={currency.code}>
									{currency.flag} {currency.code} — {currency.name}
								</option>
							{/each}
						</select>
					</span>
					<span class="text-2xl">{toFlag}</span>
				</div>
			</div>

			<!-- Main values row -->
			<div class="grid grid-cols-1 divide-y divide-white/10 md:grid-cols-2 md:divide-x md:divide-y-0">
				<!-- Amount -->
				<div class="p-6 md:p-8">
					<label for="amount" class="mb-3 block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
						You convert
					</label>
					<div class="relative">
						<input
							id="amount"
							type="number"
							inputmode="decimal"
							min="0"
							bind:value={amount}
							class="w-full bg-transparent text-4xl font-bold tracking-tight text-slate-100 outline-none placeholder:text-slate-700 focus:ring-0 sm:text-5xl"
						/>
					</div>
					<p class="mt-3 text-xs text-slate-500">{fromCurrency}</p>
				</div>

				<!-- Result -->
				<div class="p-6 md:p-8 md:bg-white/[0.03]">
					<p class="mb-3 block text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
						You receive
					</p>
					{#if isLoading && rate === 0}
						<div class="h-12 w-3/4 animate-pulse rounded-lg bg-white/5"></div>
					{:else if error}
						<p class="text-sm font-medium text-rose-400">{error}</p>
					{:else}
						<div class="flex items-baseline justify-between gap-4">
							<span class="truncate text-4xl font-bold tracking-tight {color} sm:text-5xl">
								{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
							</span>
						</div>
					{/if}
					<p class="mt-3 text-xs text-slate-500">{toCurrency}</p>
				</div>
			</div>

			<!-- Status bar -->
			<div class="flex flex-col items-center justify-between gap-2 border-t border-white/10 px-6 py-4 text-xs text-slate-500 sm:flex-row">
				<span class="flex items-center gap-2">
					<span class="relative flex h-2 w-2">
						{#if isLoading}
							<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60"></span>
						{/if}
						<span class="relative inline-flex h-2 w-2 rounded-full {isLoading ? 'bg-amber-400' : 'bg-emerald-500'}"></span>
					</span>
					{#if isLoading}
						Fetching live rate…
					{:else if error}
						Offline — showing last known rate
					{:else}
						1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
					{/if}
				</span>
				<span class="tabular-nums">{lastUpdated ? `Updated ${lastUpdated}` : ''}</span>
			</div>
		</section>

		<p class="mt-6 text-center text-xs text-slate-600">
			Live rates via open.er-api.com · for informational purposes only
		</p>
	</main>
</div>