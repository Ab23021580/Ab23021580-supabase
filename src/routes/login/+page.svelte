<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		getStoredSession,
		handleOAuthCallback,
		signInWithGoogle,
		signInWithPassword,
		signUpWithPassword
	} from '$lib/supabase/auth';

	// 介面模式：'signup' 或 'login'
	let mode = $state('signup'); 

	// 表單狀態
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let rememberMe = $state(true);
	let isLoading = $state(false);
	
	// 提示訊息
	let errorMessage = $state('');
	let successMessage = $state('');

	onMount(async () => {
		try {
			const isOAuth = await handleOAuthCallback();
			if (isOAuth) {
				successMessage = 'Google 登入成功！正在導向...';
				setTimeout(() => goto('/main'), 800);
				return;
			}
		} catch (err: any) {
			errorMessage = err.message || 'Google 登入失敗';
		}

		// 檢查是否已經登入
		const session = getStoredSession();
		if (session?.access_token) {
			goto('/main');
		}
	});

	// 驗證邏輯
	let passwordError = $derived(mode === 'signup' && password && password.length < 6 ? '密碼長度需至少 6 個字元' : '');
	let matchError = $derived(mode === 'signup' && confirmPassword && password !== confirmPassword ? '兩次輸入的密碼不一致' : '');
	
	let isFormValid = $derived(
		mode === 'login' 
			? (email && password && !isLoading)
			: (email && password.length >= 6 && password === confirmPassword && !isLoading)
	);

	function toggleMode() {
		mode = mode === 'signup' ? 'login' : 'signup';
		errorMessage = '';
		successMessage = '';
		// 重置密碼欄位以利切換
		password = '';
		confirmPassword = '';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!isFormValid) return;

		isLoading = true;
		errorMessage = '';
		successMessage = '';

		try {
			if (mode === 'login') {
				await signInWithPassword(email, password, rememberMe);
				successMessage = '登入成功！正在導向...';
				setTimeout(() => goto('/main'), 800);

			} else {
				const session = await signUpWithPassword(email, password, rememberMe);

				if (session.access_token) {
					successMessage = '帳號建立成功！正在導向...';
					setTimeout(() => goto('/main'), 800);
				} else {
					successMessage = '帳號建立成功，請完成信箱驗證後再登入。';
					mode = 'login';
					password = '';
					confirmPassword = '';
				}
			}
		} catch (err: any) {
			errorMessage = err.message || '操作失敗，請稍後再試';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-[#F0E6D8] flex items-center justify-center p-6 font-sans text-[#4A3000]">
	
	<div class="max-w-md w-full bg-[#FFF9F0] rounded-3xl p-8 shadow-[0_20px_50px_rgba(74,48,0,0.1)] transition-all" in:fly={{ y: 20, duration: 600 }}>
		
		<!-- 標題區域 -->
		<div class="text-center mb-10">
			<div class="w-16 h-16 bg-[#4A3000] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
				<span class="material-icons text-[#EADBC8] text-3xl">school</span>
			</div>
			<h1 class="text-2xl font-black uppercase tracking-tight">
				{mode === 'signup' ? '歡迎加入智學' : '智學系統登入'}
			</h1>
			<p class="text-sm opacity-60 font-medium">
				{mode === 'signup' ? '開啟你的理化探索之旅' : '請輸入您的帳號密碼以繼續'}
			</p>
		</div>

		<!-- 提示訊息區 -->
		{#if errorMessage}
			<div transition:fade class="mb-6 p-4 bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
				<span class="material-icons text-sm">error</span>
				{errorMessage}
			</div>
		{/if}

		{#if successMessage}
			<div transition:fade class="mb-6 p-4 bg-green-100 text-green-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-200">
				<span class="material-icons text-sm">check_circle</span>
				{successMessage}
			</div>
		{/if}

		<div class="mt-4 text-center">
			<button
				type="button"
				onclick={signInWithGoogle}
				disabled={isLoading}
				class="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#E0CCB3] bg-[#EADBC8] py-3 text-sm font-black tracking-widest text-[#4A3000] uppercase transition-all outline-none shadow-[0_4px_20px_rgba(74,48,0,0.08)] hover:-translate-y-0.5 hover:bg-[#E0CCB3] hover:shadow-[0_8px_25px_rgba(74,48,0,0.12)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				使用 Google 登入
			</button>
		</div>

		<div class="my-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40">
			<div class="h-px flex-1 bg-[#4A3000]/20"></div>
			<span>或使用電子郵件</span>
			<div class="h-px flex-1 bg-[#4A3000]/20"></div>
		</div>

		<!-- 表單 -->
		<form id="auth-form" onsubmit={handleSubmit} class="space-y-5">
			<div>
				<label for="email" class="block text-sm font-black uppercase tracking-widest text-[#5D4037] mb-2 ml-1">電子郵件</label>
				<input 
					type="email" 
					id="email"
					bind:value={email}
					placeholder="you@example.com"
					class="w-full {email ? 'bg-yellow-50' : 'bg-[#EADBC8]/30'} border-2 border-gray-300 focus:border-[#8B6F47] focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all font-bold placeholder:opacity-30 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
					required
				/>
			</div>

			<div>
				<div class="flex justify-between items-center mb-2 ml-1">
					<label for="password" class="block text-sm font-black uppercase tracking-widest text-[#5D4037]">
						{mode === 'signup' ? '設定密碼' : '密碼'}
					</label>
					{#if mode === 'login'}
						<button type="button" class="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity">忘記密碼？</button>
					{/if}
				</div>
				<input 
					type="password" 
					id="password"
					bind:value={password}
					placeholder={mode === 'signup' ? "至少 6 個字元" : "請輸入密碼"}
					class="w-full bg-[#EADBC8]/30 border-2 {passwordError ? 'border-red-300' : 'border-gray-300 focus:border-[#8B6F47]'} focus:bg-yellow-50 rounded-2xl px-5 py-3 outline-none transition-all font-bold placeholder:opacity-30 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
					required
				/>
				{#if passwordError}
					<span class="text-[10px] text-red-500 font-bold mt-1 ml-1">{passwordError}</span>
				{/if}
			</div>

			{#if mode === 'signup'}
				<div>
					<label for="confirm" class="block text-sm font-black uppercase tracking-widest text-[#5D4037] mb-2 ml-1">確認密碼</label>
					<input 
						type="password" 
						id="confirm"
						bind:value={confirmPassword}
						placeholder="再次輸入密碼"
						class="w-full {confirmPassword ? 'bg-yellow-50' : 'bg-[#EADBC8]/30'} border-2 {matchError ? 'border-red-300' : 'border-gray-300 focus:border-[#8B6F47]'} focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all font-bold placeholder:opacity-30 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
						required
					/>
					{#if matchError}
						<span class="text-[10px] text-red-500 font-bold mt-1 ml-1">{matchError}</span>
					{/if}
				</div>
			{:else}
				<div class="flex items-center gap-2 ml-1">
					<input 
						type="checkbox" 
						id="remember" 
						bind:checked={rememberMe}
						class="w-4 h-4 accent-[#4A3000]"
					/>
					<label for="remember" class="text-xs font-bold opacity-60 cursor-pointer select-none">保持登入狀態</label>
				</div>
			{/if}
		</form>

		<div class="mt-8 text-center">
			<button 
				form="auth-form"
				type="submit"
				disabled={!isFormValid}
				class="w-full py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 border-2 border-[#4A3000] outline-none bg-[#4A3000] text-[#EADBC8] mb-6 translate-x-[3px]
				{!isFormValid ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#3D2800] active:scale-[0.98]'}"
			>
				{#if isLoading}
					<div class="w-5 h-5 border-3 border-[#EADBC8]/30 border-t-[#EADBC8] rounded-full animate-spin"></div>
					{mode === 'signup' ? '處理中...' : '驗證中...'}
				{:else}
					{mode === 'signup' ? '建立帳號' : '立即登入'}
				{/if}
			</button>


			<p class="text-xs font-bold opacity-40">
				{mode === 'signup' ? '已經有帳號了？' : '還沒有帳號？'}
				<button 
					type="button"
					onclick={toggleMode}
					class="text-[#8B6F47] hover:underline underline-offset-4 ml-1 border-none bg-transparent p-0 m-0 focus:outline-none shadow-none cursor-pointer"
				>
					{mode === 'signup' ? '立即登入' : '註冊新帳號'}
				</button>
			</p>
		</div>
	</div>

</div>

<style>
	:global(body) {
		background-color: #EADBC8;
		margin: 0;
	}
	
	input:focus {
		box-shadow: 0 10px 20px rgba(74, 48, 0, 0.05);
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	.animate-spin {
		animation: spin 1s linear infinite;
	}
	.border-3 {
		border-width: 3px;
	}
</style>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
